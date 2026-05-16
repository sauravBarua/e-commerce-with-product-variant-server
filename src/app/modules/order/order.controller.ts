import { Request, Response } from "express";
import status from "http-status";
import { IQueryParams } from "../../interfaces/query.interface";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { OrderService } from "./order.service";

const createOrder = catchAsync(async (req: Request, res: Response) => {
  const order = await OrderService.createOrder(req.user, req.body);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Order placed successfully",
    data: order,
  });
});

const getMyOrders = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderService.getMyOrders(req.user, req.query as IQueryParams);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Orders fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getAllOrders = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderService.getAllOrders(req.query as IQueryParams);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Orders fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getOrderById = catchAsync(async (req: Request, res: Response) => {
  const order = await OrderService.getOrderById(req.params.id as string, req.user);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Order fetched successfully",
    data: order,
  });
});

const updateOrderStatus = catchAsync(async (req: Request, res: Response) => {
  const order = await OrderService.updateOrderStatus(req.params.id as string, req.body);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Order status updated successfully",
    data: order,
  });
});

const cancelOrder = catchAsync(async (req: Request, res: Response) => {
  await OrderService.cancelOrder(req.params.id as string, req.user);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Order cancelled successfully",
  });
});

export const OrderController = {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
};
