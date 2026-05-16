import { Request, Response } from "express";
import status from "http-status";
import { IQueryParams } from "../../interfaces/query.interface";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { BrandService } from "./brand.service";

const createBrand = catchAsync(async (req: Request, res: Response) => {
  const logo = req.file?.path;
  const payload = { ...req.body, ...(logo && { logo }) };

  const brand = await BrandService.createBrand(payload);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Brand created successfully",
    data: brand,
  });
});

const getAllBrands = catchAsync(async (req: Request, res: Response) => {
  const result = await BrandService.getAllBrands(req.query as IQueryParams);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Brands fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getBrandById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const brand = await BrandService.getBrandById(id as string);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Brand fetched successfully",
    data: brand,
  });
});

const updateBrand = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const logo = req.file?.path;
  const payload = { ...req.body, ...(logo && { logo }) };

  const brand = await BrandService.updateBrand(id as string, payload);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Brand updated successfully",
    data: brand,
  });
});

const deleteBrand = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  await BrandService.deleteBrand(id as string);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Brand deleted successfully",
  });
});

export const BrandController = {
  createBrand,
  getAllBrands,
  getBrandById,
  updateBrand,
  deleteBrand,
};
