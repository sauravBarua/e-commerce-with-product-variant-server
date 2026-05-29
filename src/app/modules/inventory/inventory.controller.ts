import { Request, Response } from "express";
import status from "http-status";
import { IQueryParams } from "../../interfaces/query.interface";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { InventoryService } from "./inventory.service";

const getAllInventory = catchAsync(async (req: Request, res: Response) => {
  const result = await InventoryService.getAllInventory(req.query as IQueryParams);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Inventory fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getInventoryByVariantId = catchAsync(async (req: Request, res: Response) => {
  const inventory = await InventoryService.getInventoryByVariantId(req.params.variantId as string);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Inventory fetched successfully",
    data: inventory,
  });
});

const updateInventory = catchAsync(async (req: Request, res: Response) => {
  const inventory = await InventoryService.updateInventory(req.params.variantId as string, req.body);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Inventory updated successfully",
    data: inventory,
  });
});

const addQuantity = catchAsync(async (req: Request, res: Response) => {
  const inventory = await InventoryService.addQuantity(req.params.variantId as string, req.body);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Quantity added successfully",
    data: inventory,
  });
});

export const InventoryController = {
  getAllInventory,
  getInventoryByVariantId,
  updateInventory,
  addQuantity,
};
