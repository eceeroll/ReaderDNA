import type { Request } from "express";

export function parseNumericIdParam(req: Request): number | null {
  const raw = req.params.id;

  if (typeof raw !== "string" || raw.length === 0) {
    return null;
  }

  // Digits only — rejects floats, signs, scientific notation, and empty.
  if (!/^\d+$/.test(raw)) {
    return null;
  }

  const id = Number(raw);

  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  return id;
}
