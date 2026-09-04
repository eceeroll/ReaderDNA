import { Router } from "express";
import {
  createBook,
  deleteBook,
  getBooks,
  updateBook,
} from "../controllers/book.controller.js";

const router = Router();

router.get("/books", getBooks);
router.post("/books", createBook);
router.put("/books/:id", updateBook);
router.delete("/books/:id", deleteBook);

export default router;
