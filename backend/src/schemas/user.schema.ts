import { z } from "zod";

export const registerUserSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8, "Password must be at least 8 characters.")
                        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
                        .regex(/[0-9]/, "Password must contain at least one number"),
});

export type RegisterUserInput = z.infer<typeof registerUserSchema>;