import z from "zod";

const productVariantAttributeSchema = z.object({
  key: z.string().min(1, "Attribute key is required"),
  value: z.string().min(1, "Attribute value is required"),
});

const productSpecificationSchema = z.object({
  group: z.string().min(1, "Specification group is required"),
  key: z.string().min(1, "Specification key is required"),
  value: z.string().min(1, "Specification value is required"),
});

const createVariantSchema = z.object({
  sku: z.string().optional(),
  price: z.coerce.number().positive("Price must be a positive number"),
  attributes: z
    .array(productVariantAttributeSchema)
    .min(1, "At least one attribute is required"),
});

export const createProductZodSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().min(1, "Description is required"),
  brandId: z.string().uuid("Invalid brand ID"),
  categoryId: z.string().uuid("Invalid category ID"),
  isActive: z.boolean().optional(),
  specifications: z.array(productSpecificationSchema).optional(),
  variants: z.array(createVariantSchema).min(1, "At least one variant is required"),
});

export const updateProductZodSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  brandId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  isActive: z.boolean().optional(),
});

export const createVariantZodSchema = z.object({
  sku: z.string().optional(),
  price: z.coerce.number().positive("Price must be a positive number"),
  attributes: z
    .array(productVariantAttributeSchema)
    .min(1, "At least one attribute is required"),
});

export const updateVariantZodSchema = z.object({
  sku: z.string().optional(),
  price: z.coerce.number().positive().optional(),
  attributes: z.array(productVariantAttributeSchema).optional(),
});

