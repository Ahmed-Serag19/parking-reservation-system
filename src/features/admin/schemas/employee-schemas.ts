import { z } from "zod";

export const createEmployeeSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be less than 20 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    ),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(50, "Password must be less than 50 characters"),

  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters")
    .optional(),

  email: z.string().email("Please enter a valid email address").optional(),

  role: z.enum(["admin", "employee"]),
});

export type CreateEmployeeFormData = z.infer<typeof createEmployeeSchema>;
