import { Router } from "express";
import bookRoutes from "./book.routes.js";

const router = Router();

router.use(bookRoutes);

export default router;
