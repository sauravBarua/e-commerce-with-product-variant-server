import z from "zod";

export const updateInventoryZodSchema = z.object({
  quantity: z.number().int().min(0).optional(),
  reservedQuantity: z.number().int().min(0).optional(),
  lowStockThreshold: z.number().int().min(0).optional(),
  warehouseLocation: z.string().min(1).optional(),
});

export const addQuantityZodSchema = z.object({
  quantity: z.number().int().min(1),
  reservedQuantity: z.number().int().min(0).optional(),
  lowStockThreshold: z.number().int().min(0).optional(),
  warehouseLocation: z.string().min(1).optional(),
});
