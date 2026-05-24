import status from "http-status";
import { Role } from "../../../generated/prisma/enums";
import AppError from "../../errorHelpers/AppError";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { IQueryParams } from "../../interfaces/query.interface";
import { prisma } from "../../lib/prisma";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { ICreateReviewPayload, IUpdateReviewPayload } from "./review.interface";

const reviewInclude = {
  customer: { select: { id: true, name: true } },
  product: { select: { id: true, name: true } },
};

const createReview = async (user: IRequestUser, payload: ICreateReviewPayload) => {
  const { productId, orderId, rating, comment } = payload;

  const customer = await prisma.customer.findUnique({ where: { userId: user.userId } });
  if (!customer) throw new AppError(status.NOT_FOUND, "Customer profile not found");

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      orderItems: {
        include: {
          variant: {
            include: { colorGroup: true },
          },
        },
      },
    },
  });

  if (!order) throw new AppError(status.NOT_FOUND, "Order not found");
  if (order.customerId !== customer.id)
    throw new AppError(status.FORBIDDEN, "This order does not belong to you");
  if (order.status !== "DELIVERED")
    throw new AppError(status.BAD_REQUEST, "You can only review a delivered order");

  const hasProduct = order.orderItems.some((item) => item.variant.colorGroup.productId === productId);
  if (!hasProduct)
    throw new AppError(status.BAD_REQUEST, "This product is not part of the order");

  const existing = await prisma.review.findUnique({ where: { orderId } });
  if (existing) throw new AppError(status.CONFLICT, "You have already reviewed this order");

  const review = await prisma.review.create({
    data: { customerId: customer.id, productId, orderId, rating, comment },
    include: reviewInclude,
  });

  return review;
};

const getProductReviews = async (productId: string, query: IQueryParams) => {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new AppError(status.NOT_FOUND, "Product not found");

  const result = await new QueryBuilder(prisma.review, query, { searchableFields: ["comment"] })
    .search()
    .filter()
    .sort()
    .paginate()
    .execute({ where: { productId }, include: reviewInclude });

  return result;
};

const getMyReviews = async (user: IRequestUser, query: IQueryParams) => {
  const customer = await prisma.customer.findUnique({ where: { userId: user.userId } });
  if (!customer) throw new AppError(status.NOT_FOUND, "Customer profile not found");

  const result = await new QueryBuilder(prisma.review, query, { searchableFields: ["comment"] })
    .search()
    .filter()
    .sort()
    .paginate()
    .execute({ where: { customerId: customer.id }, include: reviewInclude });

  return result;
};

const updateReview = async (user: IRequestUser, reviewId: string, payload: IUpdateReviewPayload) => {
  const customer = await prisma.customer.findUnique({ where: { userId: user.userId } });
  if (!customer) throw new AppError(status.NOT_FOUND, "Customer profile not found");

  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) throw new AppError(status.NOT_FOUND, "Review not found");
  if (review.customerId !== customer.id)
    throw new AppError(status.FORBIDDEN, "You can only edit your own reviews");

  const updated = await prisma.review.update({
    where: { id: reviewId },
    data: payload,
    include: reviewInclude,
  });

  return updated;
};

const deleteReview = async (user: IRequestUser, reviewId: string) => {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) throw new AppError(status.NOT_FOUND, "Review not found");

  const isAdmin = user.role === Role.ADMIN || user.role === Role.SUPER_ADMIN;

  if (!isAdmin) {
    const customer = await prisma.customer.findUnique({ where: { userId: user.userId } });
    if (!customer || review.customerId !== customer.id)
      throw new AppError(status.FORBIDDEN, "You can only delete your own reviews");
  }

  await prisma.review.delete({ where: { id: reviewId } });
};

export const ReviewService = {
  createReview,
  getProductReviews,
  getMyReviews,
  updateReview,
  deleteReview,
};
