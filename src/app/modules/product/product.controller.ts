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

const addColorGroup = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const colorGroup = await ProductService.addColorGroup(id as string, req.body);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Color group added successfully",
    data: colorGroup,
  });
});

const deleteColorGroup = catchAsync(async (req: Request, res: Response) => {
  const { id, colorGroupId } = req.params;

  await ProductService.deleteColorGroup(id as string, colorGroupId as string);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Color group deleted successfully",
  });
});

const addVariant = catchAsync(async (req: Request, res: Response) => {
  const { id, colorGroupId } = req.params;

  const variant = await ProductService.addVariant(id as string, colorGroupId as string, req.body);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Variant added successfully",
    data: variant,
  });
});

const updateVariant = catchAsync(async (req: Request, res: Response) => {
  const { id, colorGroupId, variantId } = req.params;

  const variant = await ProductService.updateVariant(
    id as string,
    colorGroupId as string,
    variantId as string,
    req.body,
  );

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Variant updated successfully",
    data: variant,
  });
});

const deleteVariant = catchAsync(async (req: Request, res: Response) => {
  const { id, colorGroupId, variantId } = req.params;

  await ProductService.deleteVariant(id as string, colorGroupId as string, variantId as string);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Variant deleted successfully",
  });
});

const uploadColorGroupImages = catchAsync(async (req: Request, res: Response) => {
  const { id, colorGroupId } = req.params;
  const files = req.files as Express.Multer.File[];
  const imageUrls = files.map((f) => f.path);

  const result = await ProductService.uploadColorGroupImages(
    id as string,
    colorGroupId as string,
    imageUrls,
  );

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Images uploaded successfully",
    data: result,
  });
});

const deleteColorGroupImage = catchAsync(async (req: Request, res: Response) => {
  const { id, colorGroupId, imageId } = req.params;

  await ProductService.deleteColorGroupImage(
    id as string,
    colorGroupId as string,
    imageId as string,
  );

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
  addColorGroup,
  deleteColorGroup,
  addVariant,
  updateVariant,
  deleteVariant,
  uploadColorGroupImages,
  deleteColorGroupImage,
};

