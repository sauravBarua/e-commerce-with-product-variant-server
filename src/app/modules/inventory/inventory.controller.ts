import { Request, Response } from "express";
import status from "http-status";
import { IQueryParams } from "../../interfaces/query.interface";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { InventoryService } from "./inventory.service";

const createInventory = catchAsync(async (req: Request, res: Response) => {
  const inventory = await InventoryService.createInventory(req.body);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Inventory created successfully",
    data: inventory,
  });
});

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

const getInventoryByProductId = catchAsync(async (req: Request, res: Response) => {
  const inventory = await InventoryService.getInventoryByProductId(req.params.productId as string);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Inventory fetched successfully",
    data: inventory,
  });
});

const updateInventory = catchAsync(async (req: Request, res: Response) => {
  const inventory = await InventoryService.updateInventory(req.params.productId as string, req.body);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Inventory updated successfully",
    data: inventory,
  });
});

export const InventoryController = {
  createInventory,
  getAllInventory,
  getInventoryByProductId,
  updateInventory,
};
