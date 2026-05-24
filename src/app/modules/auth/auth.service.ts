import status from "http-status";
import { JwtPayload } from "jsonwebtoken";
import { Role, UserStatus } from "../../../generated/prisma/enums";
import envVars from "../../config/env";
import AppError from "../../errorHelpers/AppError";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { jwtUtils } from "../../utils/jwt";
import { tokenUtils } from "../../utils/token";
import {
  IChangePasswordPayload,
  ILoginUserPayload,
  IRegistercustomerPayload,
  IUpdateProfilePayload,
  // IUpdateProfilePayload,
} from "./auth.interface";

const registerCustomer = async (payload: IRegistercustomerPayload) => {
  const { name, email, password } = payload;

  const data = await auth.api.signUpEmail({
    body: {
      name,
      email,
      password,
      //default values
      // needsPasswordChange: false,
      role: Role.CUSTOMER,
    },
  });

  if (!data.user) {
    throw new AppError(status.BAD_REQUEST, "Failed to register customer");
  }

  //TODO : Create customer Profile In Transaction After Sign Up Of customer In USer Model
  try {
    const customer = await prisma.$transaction(async (tx) => {
      const customerTx = await tx.customer.create({
        data: {
          userId: data.user.id,
          name: payload.name,
        },
      });

      return customerTx;
    });

    const accessToken = tokenUtils.getAccessToken({
      userId: data.user.id,
      role: data.user.role,
      name: data.user.name,
      email: data.user.email,
      status: data.user.status,
      isDeleted: data.user.isDeleted,
      emailVerified: data.user.emailVerified,
    });

    const refreshToken = tokenUtils.getRefreshToken({
      userId: data.user.id,
      role: data.user.role,
      name: data.user.name,
      email: data.user.email,
      status: data.user.status,
      isDeleted: data.user.isDeleted,
      emailVerified: data.user.emailVerified,
    });

    return {
      ...data,
      accessToken,
      refreshToken,
      customer,
    };
  } catch (error) {
    console.log("Transaction error : ", error);
    await prisma.user.delete({
      where: {
        id: data.user.id,
      },
    });
    throw error;
  }
};

// const loginUser = async (payload: ILoginUserPayload) => {
//   const { email, password } = payload;

// const data = await auth.api.signInEmail({
//   body: {
//     email,
//     password,
//   },
// });

// if (data.user.status === UserStatus.BLOCKED) {
//   throw new AppError(status.FORBIDDEN, "User is blocked");
// }

// if (data.user.isDeleted || data.user.status === UserStatus.DELETED) {
//   throw new AppError(status.NOT_FOUND, "User is deleted");
// }

// if (!data.user.emailVerified) {
//   await auth.api.sendVerificationOTP({
//     body: {
//       email,
//       type: "email-verification",
//     },
//   });
//   throw new AppError(
//     status.FORBIDDEN,
//     "Email not verified. A verification OTP has been sent to your email.",
//   );
// }

const loginUser = async (payload: ILoginUserPayload) => {
  const { email, password } = payload;

  let data;
  try {
    data = await auth.api.signInEmail({
      body: {
        email,
        password,
      },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error?.body?.code === "EMAIL_NOT_VERIFIED") {
      await auth.api.sendVerificationOTP({
        body: {
          email,
          type: "email-verification",
        },
      });
      throw new AppError(
        status.FORBIDDEN,
        "Email not verified. A verification OTP has been sent to your email.",
      );
    }
    throw error;
  }

  if (data.user.status === UserStatus.BLOCKED) {
    throw new AppError(status.FORBIDDEN, "User is blocked");
  }

  if (data.user.isDeleted || data.user.status === UserStatus.DELETED) {
    throw new AppError(status.NOT_FOUND, "User is deleted");
  }

  // rest stays the same...

  const accessToken = tokenUtils.getAccessToken({
    userId: data.user.id,
    role: data.user.role,
    name: data.user.name,
    email: data.user.email,
    status: data.user.status,
    isDeleted: data.user.isDeleted,
    emailVerified: data.user.emailVerified,
  });

  const refreshToken = tokenUtils.getRefreshToken({
    userId: data.user.id,
    role: data.user.role,
    name: data.user.name,
    email: data.user.email,
    status: data.user.status,
    isDeleted: data.user.isDeleted,
    emailVerified: data.user.emailVerified,
  });

  return {
    ...data,
    accessToken,
    refreshToken,
  };
};

const getMe = async (user: IRequestUser) => {
  const isUserExists = await prisma.user.findUnique({
    where: {
      id: user.userId,
    },
    include: {
      addresses: true,
      customer: user.role === Role.CUSTOMER ? { include: {} } : false,
      admin: user.role === Role.ADMIN || user.role === Role.SUPER_ADMIN ? true : false,
    },
  });

  if (!isUserExists) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  return isUserExists;
};

const getNewToken = async (refreshToken: string, sessionToken: string) => {
  const isSessionTokenExists = await prisma.session.findUnique({
    where: {
      token: sessionToken,
    },
    include: {
      user: true,
    },
  });

  if (!isSessionTokenExists) {
    throw new AppError(status.UNAUTHORIZED, "Invalid session token");
  }

  const verifiedRefreshToken = jwtUtils.verifyToken(
    refreshToken,
    envVars.REFRESH_TOKEN_SECRET,
  );

  if (!verifiedRefreshToken.success && verifiedRefreshToken.error) {
    throw new AppError(status.UNAUTHORIZED, "Invalid refresh token");
  }

  const data = verifiedRefreshToken.data as JwtPayload;

  const newAccessToken = tokenUtils.getAccessToken({
    userId: data.userId,
    role: data.role,
    name: data.name,
    email: data.email,
    status: data.status,
    isDeleted: data.isDeleted,
    emailVerified: data.emailVerified,
  });

  const newRefreshToken = tokenUtils.getRefreshToken({
    userId: data.userId,
    role: data.role,
    name: data.name,
    email: data.email,
    status: data.status,
    isDeleted: data.isDeleted,
    emailVerified: data.emailVerified,
  });

  const { token } = await prisma.session.update({
    where: {
      token: sessionToken,
    },
    data: {
      token: sessionToken,
      expiresAt: new Date(Date.now() + 60 * 60 * 60 * 24 * 1000),
      updatedAt: new Date(),
    },
  });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    sessionToken: token,
  };
};

const changePassword = async (
  payload: IChangePasswordPayload,
  sessionToken: string,
) => {
  const session = await auth.api.getSession({
    headers: new Headers({
      Authorization: `Bearer ${sessionToken}`,
    }),
  });

  if (!session) {
    throw new AppError(status.UNAUTHORIZED, "Invalid session token");
  }

  const { currentPassword, newPassword } = payload;

  const result = await auth.api.changePassword({
    body: {
      currentPassword,
      newPassword,
      revokeOtherSessions: true,
    },
    headers: new Headers({
      Authorization: `Bearer ${sessionToken}`,
    }),
  });

  if (session.user.needPasswordChange) {
    await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        needPasswordChange: false,
      },
    });
  }

  const accessToken = tokenUtils.getAccessToken({
    userId: session.user.id,
    role: session.user.role,
    name: session.user.name,
    email: session.user.email,
    status: session.user.status,
    isDeleted: session.user.isDeleted,
    emailVerified: session.user.emailVerified,
  });

  const refreshToken = tokenUtils.getRefreshToken({
    userId: session.user.id,
    role: session.user.role,
    name: session.user.name,
    email: session.user.email,
    status: session.user.status,
    isDeleted: session.user.isDeleted,
    emailVerified: session.user.emailVerified,
  });

  return {
    ...result,
    accessToken,
    refreshToken,
  };
};

const logoutUser = async (sessionToken: string) => {
  const result = await auth.api.signOut({
    headers: new Headers({
      Authorization: `Bearer ${sessionToken}`,
    }),
  });

  return result;
};

const verifyEmail = async (email: string, otp: string) => {
  const result = await auth.api.verifyEmailOTP({
    body: {
      email,
      otp,
    },
  });

  if (result.status && !result.user.emailVerified) {
    await prisma.user.update({
      where: {
        email,
      },
      data: {
        emailVerified: true,
      },
    });
  }
};

const forgetPassword = async (email: string) => {
  const isUserExist = await prisma.user.findUnique({
    where: {
      email,
    },
  });
  console.log("isUserExist", isUserExist);

  if (!isUserExist) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  if (!isUserExist.emailVerified) {
    throw new AppError(status.BAD_REQUEST, "Email not verified");
  }

  if (isUserExist.isDeleted || isUserExist.status === UserStatus.DELETED) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  await auth.api.requestPasswordResetEmailOTP({
    body: {
      email,
    },
  });
};

const resetPassword = async (
  email: string,
  otp: string,
  newPassword: string,
) => {
  const isUserExist = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!isUserExist) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  if (!isUserExist.emailVerified) {
    throw new AppError(status.BAD_REQUEST, "Email not verified");
  }

  if (isUserExist.isDeleted || isUserExist.status === UserStatus.DELETED) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  await auth.api.resetPasswordEmailOTP({
    body: {
      email,
      otp,
      password: newPassword,
    },
  });

  if (isUserExist.needPasswordChange) {
    await prisma.user.update({
      where: {
        id: isUserExist.id,
      },
      data: {
        needPasswordChange: false,
      },
    });
  }

  await prisma.session.deleteMany({
    where: {
      userId: isUserExist.id,
    },
  });
};

const updateProfile = async (
  user: IRequestUser,
  payload: IUpdateProfilePayload,
) => {
  const { role, userId } = user;
  const { image, address, ...profileData } = payload;

  return prisma.$transaction(async (tx) => {
    if (image) {
      await tx.user.update({
        where: { id: userId },
        data: { image },
      });
    }

    if (address) {
      const existingAddress = await tx.address.findFirst({
        where: { userId },
      });

      if (existingAddress) {
        await tx.address.update({
          where: { id: existingAddress.id },
          data: address,
        });
      } else {
        const { street, city, state, postalCode, country } = address;
        if (street && city && state && postalCode && country) {
          await tx.address.create({
            data: { userId, street, city, state, postalCode, country },
          });
        }
      }
    }

    if (role === Role.ADMIN || role === Role.SUPER_ADMIN) {
      return tx.admin.update({
        where: { userId },
        data: profileData,
        include: { user: { include: { addresses: true } } },
      });
    }

    if (role === Role.CUSTOMER) {
      return tx.customer.update({
        where: { userId },
        data: profileData,
        include: { user: { include: { addresses: true } } },
      });
    }

    throw new AppError(status.FORBIDDEN, "Invalid role");
  });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const googleLoginSuccess = async (session: Record<string, any>) => {
  const iscustomerExists = await prisma.customer.findUnique({
    where: {
      userId: session.user.id,
    },
  });

  if (!iscustomerExists) {
    await prisma.customer.create({
      data: {
        userId: session.user.id,
        name: session.user.name,
      },
    });
  }

  const accessToken = tokenUtils.getAccessToken({
    userId: session.user.id,
    role: session.user.role,
    name: session.user.name,
    email: session.user.email,
  });

  const refreshToken = tokenUtils.getRefreshToken({
    userId: session.user.id,
    role: session.user.role,
    name: session.user.name,
    email: session.user.email,
  });

  return {
    accessToken,
    refreshToken,
  };
};

export const AuthService = {
  registerCustomer,
  loginUser,
  getMe,
  updateProfile,
  getNewToken,
  changePassword,
  logoutUser,
  verifyEmail,
  forgetPassword,
  resetPassword,
  googleLoginSuccess,
};
