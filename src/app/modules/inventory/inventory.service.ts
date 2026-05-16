import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { IQueryParams } from "../../interfaces/query.interface";
import { prisma } from "../../lib/prisma";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { ICreateInventoryPayload, IUpdateInventoryPayload } from "./inventory.interface";

const createInventory = async (payload: ICreateInventoryPayload) => {
  const product = await prisma.product.findUnique({
    where: { id: payload.productId },
  });
  if (!product) {
    throw new AppError(status.NOT_FOUND, "Product not found");
  }

  const existing = await prisma.inventory.findUnique({
    where: { productId: payload.productId },
  });
  if (existing) {
    throw new AppError(status.CONFLICT, "Inventory already exists for this product");
  }

  if (payload.sku) {
    const skuExists = await prisma.inventory.findUnique({
      where: { sku: payload.sku },
    });
    if (skuExists) {
      throw new AppError(status.CONFLICT, "SKU already in use");
    }
  }

  return prisma.inventory.create({ data: payload, include: { product: { select: { id: true, name: true, price: true } } } });
};

const getAllInventory = async (queryParams: IQueryParams) => {
  const result = await new QueryBuilder(prisma.inventory, queryParams, {
    searchableFields: ["sku", "warehouseLocation"],
  })
    .search()
    .filter()
    .sort()
    .paginate()
    .execute({ include: { product: { select: { id: true, name: true, price: true } } } });

  return result;
};

const getInventoryByProductId = async (productId: string) => {
  const inventory = await prisma.inventory.findUnique({
    where: { productId },
    include: { product: { select: { id: true, name: true, price: true } } },
  });

  if (!inventory) {
    throw new AppError(status.NOT_FOUND, "Inventory not found for this product");
  }

  return inventory;
};

const updateInventory = async (productId: string, payload: IUpdateInventoryPayload) => {
  const existing = await prisma.inventory.findUnique({ where: { productId } });
  if (!existing) {
    throw new AppError(status.NOT_FOUND, "Inventory not found for this product");
  }

  if (payload.sku && payload.sku !== existing.sku) {
    const skuExists = await prisma.inventory.findUnique({ where: { sku: payload.sku } });
    if (skuExists) {
      throw new AppError(status.CONFLICT, "SKU already in use");
    }
  }

  return prisma.inventory.update({
    where: { productId },
    data: payload,
    include: { product: { select: { id: true, name: true, price: true } } },
  });
};

export const InventoryService = {
  createInventory,
  getAllInventory,
  getInventoryByProductId,
  updateInventory,
};
