import { Router } from "express";
import {
  addBookToLibrary,
  getLibrary,
} from "../controllers/library.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", authenticateToken, getLibrary);
router.post("/", authenticateToken, addBookToLibrary);

export default router;
