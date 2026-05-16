import { Request, Response } from "express";
import status from "http-status";
import { IQueryParams } from "../../interfaces/query.interface";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { CustomerService } from "./customer.service";

const getAllCustomers = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;

  const result = await CustomerService.getAllCustomers(query as IQueryParams);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Customers fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getCustomerById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const Customer = await CustomerService.getCustomerById(id);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Customer fetched successfully",
    data: Customer,
  });
});

const updateCustomer = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const payload = req.body;

  const updatedCustomer = await CustomerService.updateCustomer(id, payload);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Customer updated successfully",
    data: updatedCustomer,
  });
});

const deleteCustomer = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await CustomerService.deleteCustomer(id);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Customer deleted successfully",
    data: result,
  });
});

export const CustomerController = {
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
};
