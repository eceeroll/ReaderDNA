import { z } from "zod";

export const addToLibrarySchema = z.object({
  googleBooksId: z
    .string()
    .trim()
    .min(1)
    .regex(/^[A-Za-z0-9_-]+$/, "Invalid Google Books ID format"),
  status: z.enum(["READ", "WANT_TO_READ", "CURRENTLY_READING"]),
});

export const updateLibraryEntrySchema = z
  .object({
    status: z.enum(["READ", "WANT_TO_READ", "CURRENTLY_READING"]).optional(),
    rating: z.number().int().min(1).max(5).optional(),
  })
  .refine((data) => data.status !== undefined || data.rating !== undefined, {
    message: "At least one of status or rating must be provided",
  })
  .refine(
    (data) =>
      data.rating === undefined ||
      data.status === undefined ||
      data.status === "READ",
    {
      message: "Rating is only allowed when status is READ",
      path: ["rating"],
    },
  );

export type UpdateLibraryEntryInput = z.infer<typeof updateLibraryEntrySchema>;
export type AddToLibraryInput = z.infer<typeof addToLibrarySchema>;
