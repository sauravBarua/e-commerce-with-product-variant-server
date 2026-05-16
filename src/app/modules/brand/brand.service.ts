import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { IQueryParams } from "../../interfaces/query.interface";
import { brandSearchableFields } from "./brand.constants";
import { ICreateBrandPayload, IUpdateBrandPayload } from "./brand.interface";

const generateSlug = (name: string): string =>
  name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

const createBrand = async (payload: ICreateBrandPayload) => {
  const { name, logo, isActive } = payload;

  const isExists = await prisma.brand.findUnique({ where: { name } });
  if (isExists) {
    throw new AppError(status.CONFLICT, "Brand with this name already exists");
  }

  const slug = generateSlug(name);

  const brand = await prisma.brand.create({
    data: {
      name,
      slug,
      logo,
      isActive: isActive ?? true,
    },
  });

  return brand;
};

const getAllBrands = async (queryParams: IQueryParams) => {
  const result = await new QueryBuilder(prisma.brand, queryParams, {
    searchableFields: brandSearchableFields,
  })
    .search()
    .filter()
    .sort()
    .paginate()
    .execute();

  return result;
};

const getBrandById = async (id: string) => {
  const brand = await prisma.brand.findUnique({ where: { id } });

  if (!brand) {
    throw new AppError(status.NOT_FOUND, "Brand not found");
  }

  return brand;
};

const updateBrand = async (id: string, payload: IUpdateBrandPayload) => {
  const isExists = await prisma.brand.findUnique({ where: { id } });

  if (!isExists) {
    throw new AppError(status.NOT_FOUND, "Brand not found");
  }

  const updateData: IUpdateBrandPayload & { slug?: string } = { ...payload };

  if (payload.name) {
    updateData.slug = generateSlug(payload.name);
  }

  const brand = await prisma.brand.update({
    where: { id },
    data: updateData,
  });

  return brand;
};

const deleteBrand = async (id: string) => {
  const isExists = await prisma.brand.findUnique({ where: { id } });

  if (!isExists) {
    throw new AppError(status.NOT_FOUND, "Brand not found");
  }

  await prisma.brand.delete({ where: { id } });
};

export const BrandService = {
  createBrand,
  getAllBrands,
  getBrandById,
  updateBrand,
  deleteBrand,
};
