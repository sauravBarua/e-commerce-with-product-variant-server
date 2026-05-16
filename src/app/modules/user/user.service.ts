import status from "http-status";
import { Role } from "../../../generated/prisma/client";
import AppError from "../../errorHelpers/AppError";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { tokenUtils } from "../../utils/token";
import { ICreateAdminPayload } from "./user.interface";

const createAdmin = async (payload: ICreateAdminPayload) => {
  const userExists = await prisma.user.findUnique({
    where: {
      email: payload.admin.email,
    },
  });

  if (userExists) {
    throw new AppError(status.CONFLICT, "User with this email already exists");
  }

  const userData = await auth.api.signUpEmail({
    body: {
      email: payload.admin.email,
      password: payload.password,
      role: Role.ADMIN,
      name: payload.admin.name,
      needPasswordChange: true,
    },
  });

  // Mark email as verified since admin is created by a super admin
  await prisma.user.update({
    where: { id: userData.user.id },
    data: { emailVerified: true },
  });

  try {
    const admin = await prisma.admin.create({
      data: {
        userId: userData.user.id,
        ...payload.admin,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            status: true,
            emailVerified: true,
            image: true,
            isDeleted: true,
            deletedAt: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    const accessToken = tokenUtils.getAccessToken({
      userId: userData.user.id,
      role: userData.user.role,
      name: userData.user.name,
      email: userData.user.email,
      status: userData.user.status,
      isDeleted: userData.user.isDeleted,
      emailVerified: userData.user.emailVerified,
    });

    const refreshToken = tokenUtils.getRefreshToken({
      userId: userData.user.id,
      role: userData.user.role,
      name: userData.user.name,
      email: userData.user.email,
      status: userData.user.status,
      isDeleted: userData.user.isDeleted,
      emailVerified: userData.user.emailVerified,
    });

    return {
      ...userData,
      accessToken,
      refreshToken,
      admin,
    };
  } catch (error) {
    console.log("Transaction error : ", error);
    await prisma.user.delete({
      where: {
        id: userData.user.id,
      },
    });
    throw error;
  }
};

export const UserService = {
  createAdmin,
};
