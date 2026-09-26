import type { Request, Response } from "express";
import { discoverShelfQuerySchema } from "../schemas/book-discover.schema.js";
import { sendValidationError } from "../utils/http-responses.js";
import {
  DiscoveryShelfLoadError,
  findDiscoveryShelf,
  loadDiscoveryShelfItems,
} from "../utils/discovery-shelves.js";

export async function getDiscoverShelf(
  req: Request,
  res: Response,
): Promise<void> {
  const parsed = discoverShelfQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    sendValidationError(res, parsed.error);
    return;
  }

  const shelf = findDiscoveryShelf(parsed.data.shelf);

  try {
    const items = await loadDiscoveryShelfItems(shelf);

    res.status(200).json({
      id: shelf.id,
      title: shelf.title,
      items,
    });
  } catch (error) {
    if (error instanceof DiscoveryShelfLoadError) {
      res.status(error.statusCode).json({
        message: error.message,
      });
      return;
    }

    console.error(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
}
