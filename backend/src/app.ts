import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import bookRoutes from "./routes/book.routes.js";
import libraryRoutes from "./routes/library.routes.js";

const app = express();

app.use(express.json());
app.use(cors({ origin: "http://localhost:5173" }));

app.use("/auth", authRoutes);
app.use("/books", bookRoutes);
app.use("/library", libraryRoutes);

export default app;
