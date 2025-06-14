import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import Recipes from "../models/recipe.js";
import { verifyAdmin, verifyToken } from "../middleware/auth.js";
import { addReview, getApprovedReviews, getRecipeReviews } from '../controllers/review.js';
import Review from '../models/review.js';

const router = express.Router();

router.get("/user", (req, res) => {
  res.redirect("/");
});

// Home page
router.get("/", (req, res) => {
  try {
    res.render("index");
  } catch (err) {
    res.status(500).render("error", { error: "Failed to load homepage", status: 500 });
  }
});

// About us
router.get("/about-us", async (req, res) => {
  try {
    // Get total number of users
    const totalUsers = await User.countDocuments();
    
    // Get total number of recipes
    const totalRecipes = await Recipes.countDocuments();
    
    // Get total number of recipe categories
    const categories = await Recipes.distinct('category');
    const totalCategories = categories.length;
    
    // Get total number of favorites across all users
    const usersWithFavorites = await User.find({ favorites: { $exists: true, $ne: [] } });
    const totalFavorites = usersWithFavorites.reduce((sum, user) => sum + user.favorites.length, 0);

    // Get approved reviews with populated user and recipe data
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

    console.log('Fetched reviews:', reviews); // Debug log

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
    res.status(500).render("error", { error: "Failed to load About Us page" });
  }
});

// Contact us
router.get("/contact-us", (req, res) => {
  try {
    res.render("contact-us");
  } catch (err) {
    res.status(500).render("error", { error: "Failed to load Contact Us page", status: 500 });
  }
});

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
      return res.status(404).render("error", { error: "Recipe not found", status: 404 });
    }
    res.render("recipe-details", { recipe });
  } catch (err) {
    res.status(500).render("error", { error: "Failed to load recipe details", status: 500 });
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
    res.render("user/profile", { recipes });
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

// Review routes
router.post('/recipes/:recipeId/reviews', verifyToken, addReview);
router.get('/reviews/approved', getApprovedReviews);
router.get('/recipes/:recipeId/reviews', getRecipeReviews);

export default router;
