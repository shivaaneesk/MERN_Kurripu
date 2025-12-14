import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";

import authRoutes from "./Routes/authRoutes.js";
import notesRoutes from "./Routes/noteRoutes.js";
import { connectDB } from "./Config/db.js";
import rateLimiter from "./Middleware/rateLimiter.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5004;
const __dirname = path.resolve();

// middleware
if (process.env.NODE_ENV !== "production") {
  app.use(
    cors({
      origin: "http://localhost:5173",
    })
  );
}
app.use(express.json()); 
app.use(rateLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/notes", notesRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../Frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../Frontend", "dist", "index.html"));
  });
}

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log("Server started on PORT:", PORT);
  });
});