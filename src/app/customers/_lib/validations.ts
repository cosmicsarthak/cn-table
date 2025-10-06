// src/app/customers/_lib/validations.ts
import * as z from "zod";

export const createCustomerSchema = z.object({
    name: z
        .string()
        .min(1, "Customer name is required")
        .max(100, "Customer name must be less than 100 characters")
        .trim()
        .transform((val) => val.replace(/\s+/g, " ")), // Normalize spaces
});

export const updateCustomerSchema = z.object({
    name: z
        .string()
        .min(1, "Customer name is required")
        .max(100, "Customer name must be less than 100 characters")
        .trim()
        .transform((val) => val.replace(/\s+/g, " ")),
});

export type CreateCustomerSchema = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerSchema = z.infer<typeof updateCustomerSchema>;