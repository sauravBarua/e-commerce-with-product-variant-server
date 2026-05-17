import z from "zod";
import { OrderStatus } from "../../../generated/prisma/enums";

export const createOrderZodSchema = z.object({
  items: z
    .array(
      z.object({
        variantId: z.string().min(1, "Variant ID is required"),
        quantity: z.number().int().min(1, "Quantity must be at least 1"),
      }),
    )
    .min(1, "At least one item is required"),
  addressId: z.string().optional(),
});

export const updateOrderStatusZodSchema = z.object({
  status: z.enum(
    Object.values(OrderStatus) as [string, ...string[]],
  ),
});
