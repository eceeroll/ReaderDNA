import type { Request } from "express";

export function parseNumericIdParam(req: Request): number | null {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    return null;
  }

  return id;
}
