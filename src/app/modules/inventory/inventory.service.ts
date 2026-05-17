import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { IQueryParams } from "../../interfaces/query.interface";
import { prisma } from "../../lib/prisma";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { IUpdateInventoryPayload } from "./inventory.interface";

const variantInclude = {
  variant: {
    include: {
      attributes: true,
      colorGroup: {
        include: {
          product: { select: { id: true, name: true, slug: true } },
        },
      },
    },
  },
};

const getAllInventory = async (queryParams: IQueryParams) => {
  const result = await new QueryBuilder(prisma.inventory, queryParams, {
    searchableFields: ["warehouseLocation"],
  })
    .search()
    .filter()
    .sort()
    .paginate()
    .execute({ include: variantInclude });

  return result;
};

const getInventoryByVariantId = async (variantId: string) => {
  const inventory = await prisma.inventory.findUnique({
    where: { variantId },
    include: variantInclude,
  });

  if (!inventory) {
    throw new AppError(status.NOT_FOUND, "Inventory not found for this variant");
  }

  return inventory;
};

const updateInventory = async (variantId: string, payload: IUpdateInventoryPayload) => {
  const existing = await prisma.inventory.findUnique({ where: { variantId } });

  if (!existing) {
    throw new AppError(status.NOT_FOUND, "Inventory not found for this variant");
  }

  return prisma.inventory.update({
    where: { variantId },
    data: payload,
    include: variantInclude,
  });
};

export const InventoryService = {
  getAllInventory,
  getInventoryByVariantId,
  updateInventory,
};
