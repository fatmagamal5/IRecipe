import express from "express";
import { verifyAdmin, verifyToken } from "../middleware/auth.js";
import User from "../models/user.js";
import Recipes from "../models/recipe.js";
import Activity from "../models/activity.js";

const router = express.Router();

// Apply verifyToken first, then verifyAdmin
router.use(verifyToken);
router.use(verifyAdmin);

// Admin dashboard
router.get("/", async (req, res) => {
  res.redirect('/admin/dashboard');
});

// Admin dashboard
router.get("/dashboard", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalRecipes = await Recipes.countDocuments();
    const recentActivities = await Activity.find()
      .sort({ createdAt: -1 })
      .limit(10);
    res.render("admin/dashboard", {
      totalUsers,
      totalRecipes,
      recentActivities,
      user: req.user
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).render("admin/dashboard", {
      totalUsers: 0,
      totalRecipes: 0,
      recentActivities: [],
      user: req.user
    });
  }
});

// User management
router.get("/users", async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 }); // Sort by creation date, newest first
    
    res.render("admin/users", { 
      title: "User Management", 
      users: users.map(user => ({
        ...user.toObject(),
        createdAt: user.createdAt
      })), 
      user: req.user 
    });
  } catch (error) {
    console.error("Users error:", error);
    res.status(500).render("error", {
      message: "Error loading users. Please try again later.",
      error: process.env.NODE_ENV === 'development' ? error : null
    });
  }
});

// Recipe management
router.get("/recipes", async (req, res) => {
  try {
    const recipes = await Recipes.find().populate("author", "username");
    res.render("admin/recipes", { title: "Recipe Management", recipes, user: req.user });
  } catch (error) {
    console.error("Recipes error:", error);
    res.status(500).render("error", {
      message: "Error loading recipes. Please try again later.",
      error: process.env.NODE_ENV === 'development' ? error : null
    });
  }
});

export default router;
