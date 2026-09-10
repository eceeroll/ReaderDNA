import { Router } from "express";
import { loginUser, registerUser } from "../controllers/auth.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";
import type { Request, Response } from "express";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

// protected route
router.get("/me", authenticateToken, (req: Request, res: Response) => {
  res.status(200).json({ user: req.user });
});

export default router;
