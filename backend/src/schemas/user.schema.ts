import { z } from "zod";

const normalizedEmail = z
  .string()
  .transform((value) => value.trim().toLowerCase())
  .pipe(z.email("Invalid email address"));

export const registerUserSchema = z.object({
  email: normalizedEmail,
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

export const loginUserSchema = z.object({
  email: normalizedEmail,
  password: z.string().min(8),
});

export type LoginUserInput = z.infer<typeof loginUserSchema>;
export type RegisterUserInput = z.infer<typeof registerUserSchema>;
