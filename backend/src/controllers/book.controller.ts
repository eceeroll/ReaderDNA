import type { Request, Response } from "express";
import { prisma } from "../prisma/client.js";
import { parseNumericIdParam } from "../utils/parse-numeric-id-param.js";

export async function getBooks(_req: Request, res: Response): Promise<void> {
  try {
    const books = await prisma.book.findMany({
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json(books);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
}

export async function getBookById(req: Request, res: Response): Promise<void> {
  const id = parseNumericIdParam(req);

  if (id === null) {
    res.status(400).json({
      message: "Invalid id",
    });
    return;
  }

  try {
    const book = await prisma.book.findUnique({ where: { id } });

    if (!book) {
      res.status(404).json({
        message: "Record not found",
      });
      return;
    }

    res.status(200).json(book);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
}
