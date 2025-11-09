// backend/server.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import booksRoute from "./routes/books.js";

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/booktracker")
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.log(err));

app.use("/books", booksRoute);

app.listen(3000, () => console.log("Server running on port 3000"));
