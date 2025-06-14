import Review from '../models/review.js';
import Recipe from '../models/recipe.js';
import { logActivity } from '../utils/activityLogger.js';

// Add a review
export const addReview = async (req, res) => {
  try {
    const { recipeId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user._id;

    // Validate input
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    if (!comment || comment.trim().length === 0) {
      return res.status(400).json({ error: 'Comment is required' });
    }

    // Check if recipe exists
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    // Check if user has already reviewed this recipe
    const existingReview = await Review.findOne({ user: userId, recipe: recipeId });
    if (existingReview) {
      return res.status(400).json({ error: 'You have already reviewed this recipe' });
    }

    // Create new review
    const review = new Review({
      user: userId,
      recipe: recipeId,
      rating,
      comment: comment.trim(),
      isApproved: false // Reviews need approval before showing
    });

    await review.save();

    // Log the activity
    await logActivity({
      type: 'recipe_reviewed',
      description: `User reviewed recipe: ${recipe.title}`,
      user: userId,
      recipe: recipeId
    });

    res.status(201).json({
      message: 'Review submitted successfully and pending approval',
      review
    });
  } catch (error) {
    console.error('Review submission error:', error);
    res.status(500).json({ error: 'Failed to submit review' });
  }
};

// Get approved reviews for about page
export const getApprovedReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ isApproved: true })
      .populate('user', 'name profilePicture')
      .populate('recipe', 'title')
      .sort({ createdAt: -1 })
      .limit(6);

    res.status(200).json(reviews);
  } catch (error) {
    console.error('Error fetching approved reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
};

// Get reviews for a specific recipe
export const getRecipeReviews = async (req, res) => {
  try {
    const { recipeId } = req.params;
    const reviews = await Review.find({ 
      recipe: recipeId,
      isApproved: true 
    })
      .populate('user', 'name profilePicture')
      .sort({ createdAt: -1 });

    res.status(200).json(reviews);
  } catch (error) {
    console.error('Error fetching recipe reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
}; 