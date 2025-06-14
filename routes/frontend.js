import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import Recipes from "../models/recipe.js";
import { verifyAdmin, verifyToken } from "../middleware/auth.js";
import { addReview, getApprovedReviews, getRecipeReviews } from '../controllers/review.js';
import Review from '../models/review.js';

const router = express.Router();

// Redirect /user to homepage
router.get("/user", (req, res) => {
  res.redirect("/");
});

// Home page
router.get("/", (req, res) => {
  try {
    res.render("index");
  } catch (err) {
    res.status(500).render("error", {
      error: "Failed to load homepage",
      message: err.message || "An error occurred",
      status: 500
    });
  }
});

// About us
router.get("/about-us", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalRecipes = await Recipes.countDocuments();
    const categories = await Recipes.distinct('category');
    const totalCategories = categories.length;
    const usersWithFavorites = await User.find({ favorites: { $exists: true, $ne: [] } });
    const totalFavorites = usersWithFavorites.reduce((sum, user) => sum + user.favorites.length, 0);

    const reviews = await Review.find({ isApproved: true })
      .populate({
        path: 'user',
        select: 'name profilePicture'
      })
      .populate({
        path: 'recipe',
        select: 'title'
      })
      .sort({ createdAt: -1 })
      .limit(6);

    res.render("about-us", {
      stats: {
        users: totalUsers,
        recipes: totalRecipes,
        categories: totalCategories,
        favorites: totalFavorites
      },
      reviews: reviews || []
    });
  } catch (err) {
    console.error("About us error:", err);
    res.status(500).render("error", {
      error: "Failed to load About Us page",
      message: err.message || "Something went wrong",
      status: 500
    });
  }
});

// Contact us
router.get("/contact-us", (req, res) => {
  try {
    res.render("contact-us");
  } catch (err) {
    res.status(500).render("error", {
      error: "Failed to load Contact Us page",
      message: err.message || "Something went wrong",
      status: 500
    });
  }
});

// All recipes
router.get("/recipes", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 9;
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
    res.status(500).render("error", {
      error: "Failed to load recipes",
      message: err.message || "Something went wrong",
      status: 500
    });
  }
});

// Recipe details
router.get("/recipe-details/:id", async (req, res) => {
  try {
    const recipe = await Recipes.findById(req.params.id).populate("author");
    if (!recipe) {
      return res.status(404).render("error", {
        error: "Recipe not found",
        message: "The recipe you are looking for does not exist.",
        status: 404
      });
    }
    res.render("recipe-details", { recipe });
  } catch (err) {
    res.status(500).render("error", {
      error: "Failed to load recipe details",
      message: err.message || "Something went wrong",
      status: 500
    });
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
    const recipes = await Recipes.find({ author: user._id });
    res.render("user/profile", { recipes });
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).render("error", {
      error: "Failed to load profile",
      message: error.message || "Something went wrong",
      status: 500
    });
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

  res.redirect('/admin/dashboard');
});

// Review routes
router.post('/recipes/:recipeId/reviews', verifyToken, addReview);
router.get('/reviews/approved', getApprovedReviews);
router.get('/recipes/:recipeId/reviews', getRecipeReviews);

export default router;
