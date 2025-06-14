import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import Recipes from "../models/recipe.js";
import { verifyAdmin, verifyToken } from "../middleware/auth.js";

const router = express.Router();

// Middleware to check for user from JWT
router.use(async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      res.locals.user = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    res.locals.user = user || null;
    next();
  } catch (error) {
    console.error("JWT middleware error:", error);
    res.locals.user = null;
    return next();
  }
});

router.get("/user", (req, res) => {
  res.redirect("/");
});

// Home page
router.get("/", (req, res) => {
  try {
    res.render("index");
  } catch (err) {
    res.status(500).render("error", { error: "Failed to load homepage" });
  }
});

// Contact us
router.get("/contact-us", (req, res) => {
  try {
    res.render("contact-us");
  } catch (err) {
    res.status(500).render("error", { error: "Failed to load Contact Us page" });
  }
});

export default router;
