import express from "express";
import { getAllNotes, createNote, updateNote, deleteNote, getNoteById } from "../Controller/noteController.js";
import authMiddleware from "../Middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", getAllNotes);
router.get("/:id", getNoteById);
router.post("/", createNote);
router.put("/:id", updateNote);
router.delete("/:id", deleteNote);

export default router;