import type { Request, Response } from "express";
import { prisma } from "../prisma/client.js";
import { addToLibrarySchema } from "../schemas/library.schema.js";
import { sendValidationError } from "../utils/http-responses.js";
import { mapGoogleBookToSearchResult } from "../utils/map-google-book.js";
import { isPrismaDuplicate } from "../utils/prisma-errors.js";

const GOOGLE_BOOKS_FETCH_TIMEOUT_MS = 10_000;

export async function addBookToLibrary(
  req: Request,
  res: Response,
): Promise<void> {
  const parsed = addToLibrarySchema.safeParse(req.body);

  if (!parsed.success) {
    sendValidationError(res, parsed.error);
    return;
  }

  const userId = req.user!.userId;
  const { googleBooksId, status } = parsed.data;

  try {
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
