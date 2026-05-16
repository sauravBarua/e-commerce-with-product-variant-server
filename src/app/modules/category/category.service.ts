import status from "http-status";
import { IQueryParams } from "../../interfaces/query.interface";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { ICreateCategoryPayload, IUpdateCategoryPayload } from "./category.interface";

const generateSlug = (name: string): string =>
  name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

const createCategory = async (payload: ICreateCategoryPayload) => {
  const { name, description, icon } = payload;

  const slug = generateSlug(name);

  const isExists = await prisma.category.findUnique({ where: { slug } });
  if (isExists) {
    throw new AppError(status.CONFLICT, "Category with this name already exists");
  }

  const category = await prisma.category.create({
    data: { name, slug, description, icon },
  });

  return category;
};

const getAllCategories = async (queryParams: IQueryParams) => {
  const result = await new QueryBuilder(prisma.category, queryParams, {
    searchableFields: ["name", "slug"],
  })
    .search()
    .filter()
    .sort()
    .paginate()
    .execute();

  return result;
};

const getCategoryById = async (id: string) => {
  const category = await prisma.category.findUnique({ where: { id } });

  if (!category) {
    throw new AppError(status.NOT_FOUND, "Category not found");
  }

  return category;
};

const updateCategory = async (id: string, payload: IUpdateCategoryPayload) => {
  const isExists = await prisma.category.findUnique({ where: { id } });

  if (!isExists) {
    throw new AppError(status.NOT_FOUND, "Category not found");
  }

  const updateData: IUpdateCategoryPayload & { slug?: string } = { ...payload };

  if (payload.name) {
    updateData.slug = generateSlug(payload.name);
  }

  const category = await prisma.category.update({
    where: { id },
    data: updateData,
  });

  return category;
};

const deleteCategory = async (id: string) => {
  const isExists = await prisma.category.findUnique({ where: { id } });

  if (!isExists) {
    throw new AppError(status.NOT_FOUND, "Category not found");
  }

  await prisma.category.delete({ where: { id } });
};

export const CategoryService = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
