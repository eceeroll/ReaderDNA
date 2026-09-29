import { Router } from "express";
import { getBooks, getBookById } from "../controllers/book.controller.js";
import { searchGoogleBooks } from "../controllers/book-search.controller.js";
import { getDiscoverShelf } from "../controllers/book-discover.controller.js";

const router = Router();

router.get("/", getBooks);
router.get("/search", searchGoogleBooks);
router.get("/discover", getDiscoverShelf);
router.get("/:id", getBookById);

export default router;
