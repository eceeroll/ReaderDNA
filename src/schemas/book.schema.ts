import { z } from "zod";

export const createBookSchema = z.object({
  title: z.string().min(1),
  author: z.string().min(1),
  genres: z.array(z.string()).min(1),
  pageCount: z.number().int().positive(),
  publishedYear: z.number().int().positive(),
  goodreadsRating: z.number().min(0).max(5).optional(),
});

export type CreateBookInput = z.infer<typeof createBookSchema>;
