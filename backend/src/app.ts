import express from "express";
import authRoutes from "./routes/auth.routes.js";
import bookRoutes from "./routes/book.routes.js";

const app = express();

app.use(express.json());

app.use("/auth", authRoutes);
app.use("/books", bookRoutes);

export default app;
