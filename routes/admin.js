import express from "express";
import { verifyAdmin, verifyToken, verifySessionAdmin } from "../middleware/auth.js";
import User from "../models/user.js";
import Recipe from "../models/recipe.js";
import Activity from "../models/activity.js";
import Review from '../models/review.js';
import { logActivity } from '../utils/activityLogger.js';

const router = express.Router();

// Apply verifyToken first, then verifyAdmin
router.use(verifyToken);
router.use(verifyAdmin);

// Admin dashboard
router.get("/", async (req, res) => {
  res.redirect('/admin/dashboard');
});

// Admin dashboard
router.get("/dashboard", verifySessionAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalRecipes = await Recipe.countDocuments();
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
    const recipes = await Recipe.find().populate("author", "username");
    res.render("admin/recipes", { title: "Recipe Management", recipes, user: req.user });
  } catch (error) {
    console.error("Recipes error:", error);
    res.status(500).render("error", {
      message: "Error loading recipes. Please try again later.",
      error: process.env.NODE_ENV === 'development' ? error : null
    });
  }
});

// Get reviews management page
router.get('/reviews', verifyAdmin, async (req, res) => {
  try {
    const pendingReviews = await Review.find({ isApproved: false })
      .populate('user', 'name profilePicture')
      .populate('recipe', 'title')
      .sort({ createdAt: -1 });

    const approvedReviews = await Review.find({ isApproved: true })
      .populate('user', 'name profilePicture')
      .populate('recipe', 'title')
      .sort({ createdAt: -1 });

    res.render('admin/reviews', {
      title: 'Review Management',
      pendingReviews,
      approvedReviews,
      user: req.user
    });
  } catch (error) {
    console.error('Error loading reviews:', error);
    res.status(500).render('error', {
      message: 'Error loading reviews',
      error: process.env.NODE_ENV === 'development' ? error : null
    });
  }
});

// Get pending reviews
router.get('/reviews/pending', verifyAdmin, async (req, res) => {
  try {
    console.log('Fetching pending reviews...');
    const reviews = await Review.find({ isApproved: false })
      .populate('user', 'name profilePicture')
      .populate('recipe', 'title')
      .sort({ createdAt: -1 });
    console.log('Found pending reviews:', reviews.length);
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching pending reviews:', error);
    res.status(500).json({ error: 'Failed to fetch pending reviews' });
  }
});

// Get approved reviews
router.get('/reviews/approved', verifyAdmin, async (req, res) => {
  try {
    console.log('Fetching approved reviews...');
    const reviews = await Review.find({ isApproved: true })
      .populate('user', 'name profilePicture')
      .populate('recipe', 'title')
      .sort({ createdAt: -1 });
    console.log('Found approved reviews:', reviews.length);
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching approved reviews:', error);
    res.status(500).json({ error: 'Failed to fetch approved reviews' });
  }
});

// Get single review
router.get('/reviews/:reviewId', verifyAdmin, async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId)
      .populate('user', 'name profilePicture')
      .populate('recipe', 'title');
    
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    res.json(review);
  } catch (error) {
    console.error('Error fetching review:', error);
    res.status(500).json({ error: 'Failed to fetch review' });
  }
});

// Approve review
router.post('/reviews/:reviewId/approve', verifyAdmin, async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    review.isApproved = true;
    await review.save();
    
    // Log the activity using existing logger
    await logActivity(
      'review_approved',
      `Admin approved review for recipe: ${review.recipe}`,
      req.user._id,
      review.recipe
    );
    
    res.json({ message: 'Review approved successfully' });
  } catch (error) {
    console.error('Error approving review:', error);
    res.status(500).json({ error: 'Failed to approve review' });
  }
});

// Reject review
router.post('/reviews/:reviewId/reject', verifyAdmin, async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    // Log the activity before deleting
    await logActivity(
      'review_rejected',
      `Admin rejected review for recipe: ${review.recipe}`,
      req.user._id,
      review.recipe
    );
    
    await review.deleteOne();
    res.json({ message: 'Review rejected successfully' });
  } catch (error) {
    console.error('Error rejecting review:', error);
    res.status(500).json({ error: 'Failed to reject review' });
  }
});

// Delete approved review
router.delete('/reviews/:reviewId', verifyAdmin, async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    if (!review.isApproved) {
      return res.status(400).json({ error: 'Cannot delete pending reviews' });
    }
    
    // Log the activity before deleting
    await logActivity(
      'review_deleted',
      `Admin deleted review for recipe: ${review.recipe}`,
      req.user._id,
      review.recipe
    );
    
    await review.deleteOne();
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

// Get pending reviews count
router.get('/reviews/pending/count', verifyAdmin, async (req, res) => {
  try {
    const count = await Review.countDocuments({ isApproved: false });
    res.json({ count });
  } catch (error) {
    console.error('Error getting pending reviews count:', error);
    res.status(500).json({ error: 'Failed to get pending reviews count' });
  }
});

export default router;
