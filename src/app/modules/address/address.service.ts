import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { IQueryParams } from "../../interfaces/query.interface";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { ICreateAddressPayload, IUpdateAddressPayload } from "./address.interface";

const createAddress = async (payload: ICreateAddressPayload) => {
  const address = await prisma.address.create({ data: payload });
  return address;
};

const getAllAddresses = async (queryParams: IQueryParams) => {
  const result = await new QueryBuilder(prisma.address, queryParams, {
    searchableFields: ["street", "city", "state", "country"],
  })
    .search()
    .filter()
    .sort()
    .paginate()
    .execute();

  return result;
};

const getAddressById = async (id: string) => {
  const address = await prisma.address.findUnique({ where: { id } });

  if (!address) {
    throw new AppError(status.NOT_FOUND, "Address not found");
  }

  return address;
};

const updateAddress = async (id: string, payload: IUpdateAddressPayload) => {
  const existing = await prisma.address.findUnique({ where: { id } });

  if (!existing) {
    throw new AppError(status.NOT_FOUND, "Address not found");
  }

  const address = await prisma.address.update({ where: { id }, data: payload });
  return address;
};

const getMyAddresses = async (userId: string) => {
  const addresses = await prisma.address.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
  return addresses;
};

const deleteAddress = async (id: string) => {
  const existing = await prisma.address.findUnique({ where: { id } });

  if (!existing) {
    throw new AppError(status.NOT_FOUND, "Address not found");
  }

  await prisma.address.delete({ where: { id } });
};

export const AddressService = {
  createAddress,
  getAllAddresses,
  getMyAddresses,
  getAddressById,
  updateAddress,
  deleteAddress,
};
