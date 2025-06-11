import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import Recipes from "../models/recipe.js";
import auth from "../middlewares/auth.js";

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


router.get("/user" ,(req,res)=>{
  res.redirect("/")
})

router.get("/admin" ,(req,res)=>{
  res.redirect("/admin/dashboard")
})

// Home page
router.get("/", (req, res) => {
  try {
    res.render("index");
  } catch (err) {
    res.status(500).render("error", { error: "Failed to load homepage" });
  }
});

// About us
router.get("/about-us", (req, res) => {
  try {
    res.render("about-us");
  } catch (err) {
    res.status(500).render("error", { error: "Failed to load About Us page" });
  }
});

// Contact us
router.get("/contact-us", (req, res) => {
  try {
    res.render("contact-us");
  } catch (err) {
    res
      .status(500)
      .render("error", { error: "Failed to load Contact Us page" });
  }
});

// All recipes
router.get("/recipes", async (req, res) => {
  try {
    const recipes = await Recipes.find();
    res.render("recipes", { recipes });
  } catch (err) {
    res.status(500).render("error", { error: "Failed to load recipes" });
  }
});

// Recipe details
router.get("/recipe-details/:id", async (req, res) => {
  try {
    const recipe = await Recipes.findById(req.params.id).populate("author");
    if (!recipe) {
      return res.status(404).render("error", { error: "Recipe not found" });
    }
    res.render("recipe-details", { recipe });
  } catch (err) {
    res.status(500).render("error", { error: "Failed to load recipe details" });
  }
});

// User profile
router.get("/profile", auth(["admin", "user"]), async (req, res) => {
  try {
    const user = res.locals.user;
    const recipes = await Recipes.find({ author: user._id }).populate(
      "author",
      "name email"
    );
    res.render("user/profile", { recipes, isProfilePage: true });
  } catch (err) {
    res.status(500).render("error", { error: "Failed to load profile" });
  }
});

router.get("/admin/dashboard", auth(["admin"]), (req, res) => {
  res.render("admin/dashboard");
});

router.get("/admin/users", auth(["admin"]), async (req, res) => {
  res.render("admin/users", { users: await User.find() });
});

router.get("/admin/recipes", auth(["admin"]), async (req, res) => {
  res.render("admin/recipes", { recipes: await Recipes.find() });
});

export default router;
