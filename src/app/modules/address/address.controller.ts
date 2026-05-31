import { Request, Response } from "express";
import status from "http-status";
import { IQueryParams } from "../../interfaces/query.interface";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { AddressService } from "./address.service";

const createAddress = catchAsync(async (req: Request, res: Response) => {
  const address = await AddressService.createAddress({
    ...req.body,
    userId: req.user.userId,
  });

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Address created successfully",
    data: address,
  });
});

const getAllAddresses = catchAsync(async (req: Request, res: Response) => {
  const result = await AddressService.getAllAddresses(req.query as IQueryParams);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Addresses fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getAddressById = catchAsync(async (req: Request, res: Response) => {
  const address = await AddressService.getAddressById(req.params.id as string);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Address fetched successfully",
    data: address,
  });
});

const getMyAddresses = catchAsync(async (req: Request, res: Response) => {
  const addresses = await AddressService.getMyAddresses(req.user.userId);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "My addresses fetched successfully",
    data: addresses,
  });
});

const updateAddress = catchAsync(async (req: Request, res: Response) => {
  const address = await AddressService.updateAddress(req.params.id as string, req.body);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Address updated successfully",
    data: address,
  });
});

const deleteAddress = catchAsync(async (req: Request, res: Response) => {
  await AddressService.deleteAddress(req.params.id as string);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Address deleted successfully",
  });
});

export const AddressController = {
  createAddress,
  getAllAddresses,
  getMyAddresses,
  getAddressById,
  updateAddress,
  deleteAddress,
};
