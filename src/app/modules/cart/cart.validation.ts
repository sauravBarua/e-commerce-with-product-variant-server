import z from "zod";

export const addToCartZodSchema = z.object({
  variantId: z.string().uuid("Invalid variant ID"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
});

export const updateCartItemZodSchema = z.object({
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
});
