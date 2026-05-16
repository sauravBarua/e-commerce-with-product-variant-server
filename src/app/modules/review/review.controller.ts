/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { ReviewService } from "./review.service";

const createReview = catchAsync(async (req: Request, res: Response) => {
  const result = await ReviewService.createReview(req.user, req.body);
  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Review created successfully",
    data: result,
  });
});

const getProductReviews = catchAsync(async (req: Request, res: Response) => {
  const result = await ReviewService.getProductReviews(req.params.productId as string, req.query as any);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Product reviews retrieved successfully",
    data: result,
  });
});

const getMyReviews = catchAsync(async (req: Request, res: Response) => {
  const result = await ReviewService.getMyReviews(req.user, req.query as any);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "My reviews retrieved successfully",
    data: result,
  });
});

const updateReview = catchAsync(async (req: Request, res: Response) => {
  const result = await ReviewService.updateReview(req.user, req.params.id as string, req.body);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Review updated successfully",
    data: result,
  });
});

const deleteReview = catchAsync(async (req: Request, res: Response) => {
  await ReviewService.deleteReview(req.user, req.params.id as string);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Review deleted successfully",
  });
});

export const ReviewController = {
  createReview,
  getProductReviews,
  getMyReviews,
  updateReview,
  deleteReview,
};
