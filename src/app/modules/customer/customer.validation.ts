import z from "zod";

export const updateCustomerZodSchema = z.object({
  name: z
    .string()
    .min(5, "Name must be at least 5 characters")
    .max(30, "Name must be at most 30 characters")
    .optional(),
  contactNumber: z
    .string()
    .min(11, "Contact number must be at least 11 characters")
    .max(14, "Contact number must be at most 15 characters")
    .optional(),
  address: z
    .object({
      street: z.string().min(1, "Street is required"),
      city: z.string().min(1, "City is required"),
      state: z.string().min(1, "State is required"),
      postalCode: z.string().min(1, "Postal code is required"),
      country: z.string().min(1, "Country is required"),
    })
    .optional(),
});
