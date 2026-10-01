import { z } from "zod";

export const authTokenPayloadSchema = z.object({
  userId: z.number().int().positive(),
  email: z.email(),
});

export type AuthTokenPayload = z.infer<typeof authTokenPayloadSchema>;
