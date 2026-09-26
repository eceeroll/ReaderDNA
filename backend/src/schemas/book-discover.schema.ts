import { z } from "zod";
import { DISCOVERY_SHELF_IDS } from "../utils/discovery-shelves.js";

export const discoverShelfQuerySchema = z.object({
  shelf: z.enum(DISCOVERY_SHELF_IDS),
});
