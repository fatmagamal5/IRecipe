import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user',
  },
  profilePicture: {
    type: String,
    default: '/img/default-profilePicture.png', 
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe'
  }]
}, {
  timestamps: true
});

export default mongoose.model("User", userSchema);
