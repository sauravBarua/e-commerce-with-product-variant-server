import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { CartService } from "./cart.service";

const addToCart = catchAsync(async (req: Request, res: Response) => {
  const cart = await CartService.addToCart(req.user, req.body);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Item added to cart successfully",
    data: cart,
  });
});

const getMyCart = catchAsync(async (req: Request, res: Response) => {
  const cart = await CartService.getMyCart(req.user);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Cart fetched successfully",
    data: cart,
  });
});

const updateCartItem = catchAsync(async (req: Request, res: Response) => {
  const cartItemId = req.params.cartItemId as string;

  const cart = await CartService.updateCartItem(req.user, cartItemId, req.body);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Cart item updated successfully",
    data: cart,
  });
});

const removeCartItem = catchAsync(async (req: Request, res: Response) => {
  const cartItemId = req.params.cartItemId as string;

  const cart = await CartService.removeCartItem(req.user, cartItemId);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Cart item removed successfully",
    data: cart,
  });
});

const clearCart = catchAsync(async (req: Request, res: Response) => {
  const cart = await CartService.clearCart(req.user);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Cart cleared successfully",
    data: cart,
  });
});

export const CartController = {
  addToCart,
  getMyCart,
  updateCartItem,
  removeCartItem,
  clearCart,
};
