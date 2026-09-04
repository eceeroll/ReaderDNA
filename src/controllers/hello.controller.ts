import type { Request, Response } from "express";

export function getHello(_req: Request, res: Response): void {
  res.json({ message: "Hello World" });
}
