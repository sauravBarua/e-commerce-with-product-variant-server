import z from "zod";

export const createInventoryZodSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.number().int().min(0, "Quantity must be 0 or more"),
  lowStockThreshold: z.number().int().min(0).optional(),
  sku: z.string().min(1).optional(),
  warehouseLocation: z.string().min(1).optional(),
});

export const updateInventoryZodSchema = z.object({
  quantity: z.number().int().min(0).optional(),
  lowStockThreshold: z.number().int().min(0).optional(),
  sku: z.string().min(1).optional(),
  warehouseLocation: z.string().min(1).optional(),
});
