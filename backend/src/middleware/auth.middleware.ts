import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { authTokenPayloadSchema } from "../schemas/auth.schema.js";

// Intentionally duplicated on the frontend (HTTP API contract). Backend and
// frontend stay separate app boundaries; revisit a shared contracts package if
// more API error codes/types need to stay in sync.
const AUTH_TOKEN_INVALID = "AUTH_TOKEN_INVALID";

export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json({
        message: "No token provided",
        code: AUTH_TOKEN_INVALID,
      });
      return;
    }

    const token = authHeader.slice("Bearer ".length).trim();

    if (!token) {
      res.status(401).json({
        message: "No token provided",
        code: AUTH_TOKEN_INVALID,
      });
      return;
    }

    const JWT_SECRET = process.env.JWT_SECRET;

    if (!JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined");
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const parsed = authTokenPayloadSchema.safeParse(decoded);

    if (!parsed.success) {
      res.status(401).json({
        message: "Invalid or expired token",
        code: AUTH_TOKEN_INVALID,
      });
      return;
    }

    req.user = parsed.data;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        message: "Invalid or expired token",
        code: AUTH_TOKEN_INVALID,
      });
      return;
    }

    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
