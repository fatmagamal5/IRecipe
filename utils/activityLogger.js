import Activity from '../models/activity.js';

export const logActivity = async (type, description, userId = null, recipeId = null) => {
  try {
    const activity = new Activity({
      type,
      description,
      user: userId,
      recipe: recipeId
    });
    await activity.save();
  } catch (error) {
    console.error('Error logging activity:', error);
  }
}; 