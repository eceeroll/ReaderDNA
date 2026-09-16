import { Router } from "express";
import { addBookToLibrary } from "../controllers/library.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/", authenticateToken, addBookToLibrary);

export default router;
