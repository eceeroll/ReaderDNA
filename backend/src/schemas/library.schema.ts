import { z } from "zod";

export const addToLibrarySchema = z.object({
  googleBooksId: z
    .string()
    .trim()
    .min(1)
    .regex(/^[A-Za-z0-9_-]+$/, "Invalid Google Books ID format"),
  status: z.enum(["READ", "WANT_TO_READ"]),
});

export type AddToLibraryInput = z.infer<typeof addToLibrarySchema>;
