import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import bookRoutes from "./routes/book.routes.js";
import libraryRoutes from "./routes/library.routes.js";

const app = express();

const frontendUrl = process.env.FRONTEND_URL;

if (!frontendUrl) {
  throw new Error("FRONTEND_URL is not defined");
}

app.use(express.json());
app.use(cors({ origin: frontendUrl }));

app.use("/auth", authRoutes);
app.use("/books", bookRoutes);
app.use("/library", libraryRoutes);

export default app;
