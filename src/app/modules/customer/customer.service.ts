import status from "http-status";
import { Customer, Prisma } from "../../../generated/prisma/client";
import { UserStatus } from "../../../generated/prisma/enums";
import AppError from "../../errorHelpers/AppError";
import { IQueryParams } from "../../interfaces/query.interface";
import { prisma } from "../../lib/prisma";
import { QueryBuilder } from "../../utils/QueryBuilder";
import {
  customerFilterableFields,
  customerSearchableFields,
} from "./customer.constant";
import { IUpdateCustomerPayload } from "./customer.interface";

const getAllCustomers = async (query: IQueryParams) => {
  const queryBuilder = new QueryBuilder<
    Customer,
    Prisma.CustomerWhereInput,
    Prisma.CustomerInclude
  >(prisma.customer, query, {
    searchableFields: customerSearchableFields,
    filterableFields: customerFilterableFields,
  });

  const result = await queryBuilder
    .search()
    .filter()
    .where({
      isDeleted: false,
    })
    .include({
      user: true,
    })
    .paginate()
    .sort()
    .fields()
    .execute();

  return result;
};

const getCustomerById = async (id: string) => {
  const Customer = await prisma.customer.findUnique({
    where: {
      id,
      isDeleted: false,
    },
    include: {
      user: true,
    },
  });

  if (!Customer) {
    throw new AppError(status.NOT_FOUND, "Customer not found");
  }

  return Customer;
};

const updateCustomer = async (id: string, payload: IUpdateCustomerPayload) => {
  const isCustomerExist = await prisma.customer.findUnique({
    where: { id },
  });

  if (!isCustomerExist) {
    throw new AppError(status.NOT_FOUND, "Customer not found");
  }

  const { address, ...customerData } = payload;

  const updatedCustomer = await prisma.customer.update({
    where: { id },
    data: {
      ...customerData,
      ...(address && {
        address: {
          upsert: {
            create: address,
            update: address,
          },
        },
      }),
    },
    include: {
      user: true,
    },
  });

  return updatedCustomer;
};

// soft delete
const deleteCustomer = async (id: string) => {
  const isCustomerExist = await prisma.customer.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!isCustomerExist) {
    throw new AppError(status.NOT_FOUND, "Customer not found");
  }

  await prisma.$transaction(async (tx) => {
    await tx.customer.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    await tx.user.update({
      where: { id: isCustomerExist.userId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        status: UserStatus.DELETED,
      },
    });

    await tx.session.deleteMany({
      where: { userId: isCustomerExist.userId },
    });
  });

  return { message: "Customer deleted successfully" };
};

export const CustomerService = {
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
};
