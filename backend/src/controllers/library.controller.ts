import type { Request, Response } from "express";
import { prisma } from "../prisma/client.js";
import {
  addToLibrarySchema,
  updateLibraryEntrySchema,
} from "../schemas/library.schema.js";
import { sendValidationError } from "../utils/http-responses.js";
import {
  hasRequiredGoogleBookFields,
  mapGoogleBookToSearchResult,
} from "../utils/map-google-book.js";
import { isPrismaDuplicate } from "../utils/prisma-errors.js";
import { parseNumericIdParam } from "../utils/parse-numeric-id-param.js";
const GOOGLE_BOOKS_FETCH_TIMEOUT_MS = 10_000;

export async function getLibrary(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      throw new Error("Authenticated user is missing");
    }

    const userId = req.user.userId;

    const userBooks = await prisma.userBook.findMany({
      where: { userId },
      include: {
        book: {
          select: {
            googleBooksId: true,
            title: true,
            author: true,
            coverImageUrl: true,
            averageRating: true,
            genres: true,
          },
        },
      },
    });

    const items = userBooks.map((entry) => ({
      id: entry.id,
      status: entry.status,
      rating: entry.rating,
      book: entry.book,
    }));

    res.status(200).json({ items });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
}

export async function addBookToLibrary(
  req: Request,
  res: Response,
): Promise<void> {
  const parsed = addToLibrarySchema.safeParse(req.body);

  if (!parsed.success) {
    sendValidationError(res, parsed.error);
    return;
  }

  const { googleBooksId, status } = parsed.data;

  try {
    if (!req.user) {
      throw new Error("Authenticated user is missing");
    }

    const userId = req.user.userId;

    let book = await prisma.book.findUnique({
      where: { googleBooksId: googleBooksId },
    });

    if (!book) {
      const apiKey = process.env.GOOGLE_BOOKS_API_KEY;

      if (!apiKey) {
        console.error(new Error("GOOGLE_BOOKS_API_KEY is not configured"));
        res.status(500).json({
          message: "Internal Server Error",
        });
        return;
      }

      let googleResponse: globalThis.Response;

      try {
        const url = new URL(
          `https://www.googleapis.com/books/v1/volumes/${encodeURIComponent(googleBooksId)}`,
        );
        url.searchParams.set("key", apiKey);

        googleResponse = await fetch(url, {
          signal: AbortSignal.timeout(GOOGLE_BOOKS_FETCH_TIMEOUT_MS),
        });
      } catch (error) {
        console.error(error);
        res.status(502).json({
          message:
            "Book search is temporarily unavailable. Please try again later.",
        });
        return;
      }

      if (googleResponse.status === 404) {
        res.status(404).json({
          message: "Book not found",
        });
        return;
      }

      if (!googleResponse.ok) {
        console.error(
          new Error(
            `Google Books API responded with status ${googleResponse.status}`,
          ),
        );
        res.status(502).json({
          message:
            "Book search is temporarily unavailable. Please try again later.",
        });
        return;
      }

      const googleData = await googleResponse.json();
      const mapped = mapGoogleBookToSearchResult(googleData);

      if (!hasRequiredGoogleBookFields(mapped)) {
        res.status(404).json({
          message: "Book not found",
        });
        return;
      }

      try {
        book = await prisma.book.create({
          data: {
            googleBooksId: mapped.googleBooksId,
            title: mapped.title,
            author: mapped.author,
            genres: mapped.genres,
            pageCount: mapped.pageCount,
            publishedYear: mapped.publishedYear,
            averageRating: mapped.averageRating,
            coverImageUrl: mapped.coverImageUrl,
          },
        });
      } catch (error) {
        if (!isPrismaDuplicate(error)) {
          throw error;
        }

        // Another request created this book concurrently; reuse it.
        book = await prisma.book.findUnique({
          where: { googleBooksId },
        });

        if (!book) {
          throw error;
        }
      }
    }

    try {
      const userBook = await prisma.userBook.create({
        data: {
          userId,
          bookId: book.id,
          status,
        },
      });

      res.status(201).json(userBook);
    } catch (error) {
      if (isPrismaDuplicate(error)) {
        res.status(409).json({
          message: "This book is already in your library.",
        });
        return;
      }

      throw error;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
}

export async function updateLibraryEntry(
  req: Request,
  res: Response,
): Promise<void> {
  const libraryEntryId = parseNumericIdParam(req);

  if (libraryEntryId === null) {
    res.status(400).json({
      message: "Invalid library entry id",
    });
    return;
  }

  const parsed = updateLibraryEntrySchema.safeParse(req.body);

  if (!parsed.success) {
    sendValidationError(res, parsed.error);
    return;
  }

  const { status, rating } = parsed.data;

  try {
    if (!req.user) {
      throw new Error("Authenticated user is missing");
    }

    const userId = req.user.userId;

    const userBook = await prisma.userBook.findUnique({
      where: { id: libraryEntryId, userId },
    });

    if (!userBook) {
      res.status(404).json({ message: "Record not found" });
      return;
    }

    const nextStatus = status ?? userBook.status;

    // Ratings are only valid while status is READ. Reject rating writes
    // against any other status (including rating-only patches).
    if (rating !== undefined && nextStatus !== "READ") {
      res.status(400).json({
        message: "Validation failed",
        issues: [
          {
            path: ["rating"],
            message: "Rating is only allowed when status is READ",
          },
        ],
      });
      return;
    }

    // Prisma treats `undefined` fields as "don't update".
    // Leaving READ always clears rating so invalid combos cannot persist.
    const data: {
      status?: typeof status;
      rating?: number | null;
    } = {};

    if (status !== undefined) {
      data.status = status;
    }

    if (nextStatus !== "READ") {
      data.rating = null;
    } else if (rating !== undefined) {
      data.rating = rating;
    }

    const updatedUserBook = await prisma.userBook.update({
      where: { id: libraryEntryId, userId },
      data,
    });

    res.status(200).json(updatedUserBook);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
}
