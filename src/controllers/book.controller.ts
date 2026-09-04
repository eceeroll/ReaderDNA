import type { Request, Response } from "express";
import { prisma } from "../prisma/client.js";
import { createBookSchema } from "../schemas/book.schema.js";
import { sendValidationError } from "../utils/http-responses.js";
import { parseBookId } from "../utils/parse-book-id.js";
import { isPrismaNotFound } from "../utils/prisma-errors.js";

export async function createBook(req: Request, res: Response): Promise<void> {
  const parsed = createBookSchema.safeParse(req.body);

  if (!parsed.success) {
    sendValidationError(res, parsed.error);
    return;
  }

  try {
    const book = await prisma.book.create({
      data: parsed.data,
    });

    res.status(201).json(book);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
}

export async function getBooks(_req: Request, res: Response): Promise<void> {
  try {
    const books = await prisma.book.findMany({
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json(books);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
}

export async function updateBook(req: Request, res: Response): Promise<void> {
  const id = parseBookId(req);

  if (id === null) {
    res.status(400).json({
      message: "Geçersiz id",
    });
    return;
  }

  const parsed = createBookSchema.partial().safeParse(req.body);

  if (!parsed.success) {
    sendValidationError(res, parsed.error);
    return;
  }

  try {
    const book = await prisma.book.update({
      where: { id },
      data: parsed.data,
    });

    res.status(200).json(book);
  } catch (error) {
    if (isPrismaNotFound(error)) {
      res.status(404).json({
        message: "Kayıt bulunamadı",
      });
      return;
    }

    console.error(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
}

export async function deleteBook(req: Request, res: Response): Promise<void> {
  const id = parseBookId(req);

  if (id === null) {
    res.status(400).json({
      message: "Geçersiz id",
    });
    return;
  }

  try {
    await prisma.book.delete({
      where: { id },
    });

    res.status(200).json({
      message: "Kayıt silindi",
    });
  } catch (error) {
    if (isPrismaNotFound(error)) {
      res.status(404).json({
        message: "Kayıt bulunamadı",
      });
      return;
    }

    console.error(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
}
