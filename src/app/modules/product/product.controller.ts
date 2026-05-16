import { Request, Response } from "express";
import status from "http-status";
import { IQueryParams } from "../../interfaces/query.interface";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { ProductService } from "./product.service";

const createProduct = catchAsync(async (req: Request, res: Response) => {
  const product = await ProductService.createProduct(req.body);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Product created successfully",
    data: product,
  });
});

const getAllProducts = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductService.getAllProducts(req.query as IQueryParams);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Products fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getProductById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const product = await ProductService.getProductById(id   as string);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Product fetched successfully",
    data: product,
  });
});

const updateProduct = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const product = await ProductService.updateProduct(id as string, req.body);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Product updated successfully",
    data: product,
  });
});

const deleteProduct = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  await ProductService.deleteProduct(id as string);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Product deleted successfully",
  });
});

const addVariant = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const variant = await ProductService.addVariant(id as string, req.body);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Variant added successfully",
    data: variant,
  });
});

const updateVariant = catchAsync(async (req: Request, res: Response) => {
  const { id, variantId } = req.params;

  const variant = await ProductService.updateVariant(id as string, variantId as string, req.body);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Variant updated successfully",
    data: variant,
  });
});

const deleteVariant = catchAsync(async (req: Request, res: Response) => {
  const { id, variantId } = req.params;

  await ProductService.deleteVariant(id as string, variantId as string);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Variant deleted successfully",
  });
});

const uploadVariantImages = catchAsync(async (req: Request, res: Response) => {
  const { id, variantId } = req.params;
  const files = req.files as Express.Multer.File[];
  const imageUrls = files.map((f) => f.path);

  const result = await ProductService.uploadVariantImages(id as string, variantId as string, imageUrls);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Images uploaded successfully",
    data: result,
  });
});

const deleteVariantImage = catchAsync(async (req: Request, res: Response) => {
  const { id, variantId, imageId } = req.params;

  await ProductService.deleteVariantImage(id as string, variantId as string, imageId as string);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Image deleted successfully",
  });
});

export const ProductController = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  addVariant,
  updateVariant,
  deleteVariant,
  uploadVariantImages,
  deleteVariantImage,
};

