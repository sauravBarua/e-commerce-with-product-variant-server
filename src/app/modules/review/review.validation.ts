import { z } from "zod";

export const createReviewZodSchema = z.object({
  productId: z.string("productId is required"),
  orderId: z.string("orderId is required"),
  rating: z
    .number("rating is required")
    .min(1, "Rating must be at least 1")
    .max(5, "Rating must be at most 5"),
  comment: z.string("comment is required").min(1),
});

export const updateReviewZodSchema = z.object({
  rating: z.number().min(1).max(5).optional(),
  comment: z.string().min(1).optional(),
});