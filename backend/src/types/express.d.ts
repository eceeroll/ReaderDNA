import "express";
import type { AuthTokenPayload } from "../schemas/auth.schema.js";

declare global {
  namespace Express {
    interface Request {
      user?: AuthTokenPayload;
    }
  }
}

export {};
