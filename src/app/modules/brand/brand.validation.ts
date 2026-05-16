import z from "zod";

export const createBrandZodSchema = z.object({
  name: z.string().min(1, "Brand name is required").max(100),
  isActive: z.boolean().optional(),
});

export const updateBrandZodSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  isActive: z.boolean().optional(),
});
