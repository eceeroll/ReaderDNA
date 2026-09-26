import { Router } from "express";
import {
  createBook,
  deleteBook,
  getBooks,
  getBookById,
  updateBook,
} from "../controllers/book.controller.js";
import { searchGoogleBooks } from "../controllers/book-search.controller.js";
import { getDiscoverShelf } from "../controllers/book-discover.controller.js";

const router = Router();

router.get("/", getBooks);
router.get("/search", searchGoogleBooks);
router.get("/discover", getDiscoverShelf);
router.get("/:id", getBookById);
router.post("/", createBook);
router.put("/:id", updateBook);
router.delete("/:id", deleteBook);

export default router;
