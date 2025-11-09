// routes/books.js
import express from "express";
import Book from "../models/Book.js";

const router = express.Router();

// Create book
router.post("/", async (req, res) => {
    try {
        const book = new Book(req.body);
        const saved = await book.save();
        res.json(saved);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all books
router.get("/", async (req, res) => {
    const books = await Book.find();
    res.json(books);
});

// Delete a book
router.delete("/:id", async (req, res) => {
    await Book.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
});

export default router;
