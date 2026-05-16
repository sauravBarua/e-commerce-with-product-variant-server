import z from "zod";

export const createCategoryZodSchema = z.object({
  name: z.string().min(1, "Category name is required").max(100),
  description: z.string().optional(),
});

export const updateCategoryZodSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
});
