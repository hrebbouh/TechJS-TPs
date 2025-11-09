import express from "express";
import session from "express-session";
import mongoose from "mongoose";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// MongoDB connection
mongoose.connect("mongodb://127.0.0.1:27017/tp2", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// User schema
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});
const User = mongoose.model("User", userSchema);

// Passport config
passport.use(
  new LocalStrategy(async (username, password, done) => {
    const user = await User.findOne({ username });
    if (!user) return done(null, false);
    const match = await bcrypt.compare(password, user.password);
    if (!match) return done(null, false);
    return done(null, user);
  })
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

// Middleware
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: "secret", resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, "public")));

// Dummy books data (in-memory)
const books = [
  { title: "Book 1", author: "Author 1", status: "Read" },
  { title: "Book 2", author: "Author 2", status: "Want to read" },
];

// Auth check middleware
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/login");
}

// Routes
app.get("/", (req, res) => res.redirect("/books"));

app.get("/register", (req, res) => res.render("register"));
app.post("/register", async (req, res) => {
  const hashed = await bcrypt.hash(req.body.password, 10);
  await User.create({ username: req.body.username, password: hashed });
  res.redirect("/login");
});

app.get("/login", (req, res) => res.render("login"));
app.post(
  "/login",
  passport.authenticate("local", { failureRedirect: "/login" }),
  (req, res) => res.redirect("/books")
);

app.get("/books", isAuthenticated, (req, res) => res.render("books", { books }));

app.get("/logout", (req, res) => {
  req.logout(() => {});
  res.redirect("/login");
});

// Start server
app.listen(3000, () => console.log("Server running on http://localhost:3000"));
