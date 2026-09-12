import type { Request, Response } from "express";
import { sendValidationError } from "../utils/http-responses.js";
import { mapGoogleBookToSearchResult } from "../utils/map-google-book.js";
import { searchQuerySchema } from "../schemas/book-search-schema.js";

const GOOGLE_BOOKS_SEARCH_TIMEOUT_MS = 10_000;

export async function searchGoogleBooks(
  req: Request,
  res: Response,
): Promise<void> {
  const parsed = searchQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    sendValidationError(res, parsed.error);
    return;
  }

  const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
  const query = parsed.data.q;

  if (!apiKey) {
    console.error(new Error("GOOGLE_BOOKS_API_KEY is not configured"));
    res.status(500).json({
      message: "Internal Server Error",
    });
    return;
  }

  try {
    const url = new URL("https://www.googleapis.com/books/v1/volumes");
    url.searchParams.set("q", `intitle:"${query}"`);
    url.searchParams.set("langRestrict", "en");
    url.searchParams.set("maxResults", "20");
    url.searchParams.set("key", apiKey);

    const response = await fetch(url, {
      signal: AbortSignal.timeout(GOOGLE_BOOKS_SEARCH_TIMEOUT_MS),
    });

    if (!response.ok) {
      throw new Error(
        `Google Books API responded with status ${response.status}`,
      );
    }

    const data = (await response.json()) as { items?: unknown[] };
    const items = Array.isArray(data.items)
      ? data.items
          .map(mapGoogleBookToSearchResult)
          .filter((book) => book.language === "en")
      : [];

    res.status(200).json({ items });
  } catch (error) {
    console.error(error);
    res.status(502).json({
      message:
        "Book search is temporarily unavailable. Please try again later.",
    });
  }
}
