import type { Response } from "express";
import type { z } from "zod";

export function sendValidationError(res: Response, zodError: z.ZodError): void {
  res.status(400).json({
    message: "Validation failed",
    issues: zodError.issues,
  });
}
