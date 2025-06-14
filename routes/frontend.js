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

// Favorite routes (protected)
router.get("/favorites/all", verifyUser, getFavorites);
router.post("/favorites/:recipeId", verifyUser, addFavorite);
router.delete("/favorites/:recipeId", verifyUser, removeFavorite);
// All recipes
router.get("/recipes", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 9; // 9 recipes per page
    const skip = (page - 1) * limit;

    const totalRecipes = await Recipes.countDocuments();
    const totalPages = Math.ceil(totalRecipes / limit);

    const recipes = await Recipes.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.render("recipes", { 
      recipes,
      currentPage: page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    });
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
    
    // Get user with favorites if logged in
    let user = null;
    if (res.locals.user) {
      user = await User.findById(res.locals.user._id).select('favorites');
    }
    
    res.render("recipe-details", { recipe, user });
  } catch (err) {
    res.status(500).render("error", { error: "Failed to load recipe details" });
  }
});
  

// User profile
router.get("/profile", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(res.locals.user._id).populate({
      path: 'favorites',
      populate: {
        path: 'author',
        select: 'name'
      }
    });

    // Get user's recipes
    const recipes = await Recipes.find({ author: user._id });

    res.render("user/profile", { 
      user,
      recipes 
    });
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).render("error", { error: "Failed to load profile" });
  }
});


// Handle /recipes/admin access
router.get('/recipes/admin', (req, res) => {
  if (!req.user) {
    return res.status(401).render('error', {
      error: 'Access Denied',
      message: 'Please log in to access this page',
      status: 401
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).render('error', {
      error: 'Access Denied',
      message: 'You do not have permission to access this page',
      status: 403
    });
  }

  // If user is admin, redirect to admin dashboard
  res.redirect('/admin/dashboard');
});

export default router;
