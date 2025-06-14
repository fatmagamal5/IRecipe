import mongoose from 'mongoose';

// Create a schema for logging activities
const activitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true
  },
  details: {
    type: mongoose.Schema.Types.Mixed
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create the Activity model
const Activity = mongoose.model('Activity', activitySchema);

// Function to log an activity
export const logActivity = async (userId, action, details) => {
  try {
    // Create a new activity record
    await Activity.create({
      user: userId,
      action,
      details
    });
    console.log(`Activity logged: ${action} by user ${userId}`);
  } catch (error) {
    console.error('Error logging activity:', error);
  }
}; 