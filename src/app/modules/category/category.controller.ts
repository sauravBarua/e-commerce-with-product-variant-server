import { Request, Response } from "express";
import status from "http-status";
import { IQueryParams } from "../../interfaces/query.interface";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { CategoryService } from "./category.service";

const createCategory = catchAsync(async (req: Request, res: Response) => {
  const icon = req.file?.path;
  const payload = { ...req.body, ...(icon && { icon }) };

  const category = await CategoryService.createCategory(payload);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Category created successfully",
    data: category,
  });
});

const getAllCategories = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryService.getAllCategories(req.query as IQueryParams);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Categories fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getCategoryById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const category = await CategoryService.getCategoryById(id as string);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Category fetched successfully",
    data: category,
  });
});

const updateCategory = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const icon = req.file?.path;
  const payload = { ...req.body, ...(icon && { icon }) };

  const category = await CategoryService.updateCategory(id as string, payload);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Category updated successfully",
    data: category,
  });
});

const deleteCategory = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  await CategoryService.deleteCategory(id as string);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Category deleted successfully",
  });
});

export const CategoryController = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
