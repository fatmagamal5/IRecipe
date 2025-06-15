import userModel from "../models/user.js";
import recipeModel from "../models/recipe.js";
import bcrypt from "bcryptjs";
import JsonWebToken from "jsonwebtoken";

// Middleware to verify user
export const verifyUser = async (req, res, next) => {
  try {
    // First check session
    if (req.session && req.session.user) {
      req.user = req.session.user;
      return next();
    }

    // If no session, check JWT token
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const decoded = JsonWebToken.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    // Update session with user info
    req.session.user = {
      id: user._id,
      role: user.role,
      email: user.email,
      name: user.name,
      profilePicture: user.profilePicture,
      lastActive: user.lastActive
    };

    req.user = user;
    next();
  } catch (err) {
    console.error('Auth verification error:', err);
    return res.status(401).json({ error: "Invalid token" });
  }
};

// Get all users
export const getUsers = async (req, res) => {
  try {
    const users = await userModel.find();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get user by ID
export const getUserById = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await userModel.findById(id);
    if (user == null) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update user
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({ error: "Name and email are required" });
    }

    // Check if email is already taken by another user
    const existingUser = await userModel.findOne({ email, _id: { $ne: id } });
    if (existingUser) {
      return res.status(400).json({ error: "Email is already taken" });
    }

    // Update user
    const updatedUser = await userModel.findByIdAndUpdate(
      id,
      { name, email, role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(updatedUser);
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await userModel.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Signup
export const signup = async (req, res) => {
  try {
    const { name, email, password, role = "user" } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ error: "All fields are required" });

    const user = await userModel.findOne({ email });
    if (user) return res.status(400).json({ error: "Email is taken" });

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    const newUser = await userModel.create({
      name,
      email,
      password: hash,
      role,
    });

    return res.status(201).json({ message: "User signup successfully" });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

// Signin
export const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: "All fields are required" });

    const user = await userModel.findOne({ email });
    if (!user)
      return res.status(400).json({ error: "Wrong email or password" });

    if (!(await bcrypt.compareSync(password, user.password)))
      return res.status(400).json({ error: "Wrong email or password" });

    // Create JWT token with more user information
    const token = JsonWebToken.sign(
      { 
        id: user._id, 
        role: user.role,
        email: user.email,
        name: user.name
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Store complete user info in session
    req.session.user = {
      id: user._id,
      role: user.role,
      email: user.email,
      name: user.name,
      profilePicture: user.profilePicture,
      lastActive: user.lastActive
    };

    // Set JWT token in cookie with secure options
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    // Update lastActive timestamp
    await userModel.findByIdAndUpdate(user._id, { lastActive: new Date() });

    return res.status(200).json({ 
      message: "User signin successfully", 
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture
      }
    });
  } catch (e) {
    console.error('Signin error:', e);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

// Logout
export const logout = async (req, res) => {
  try {
    // Clear the JWT token cookie
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    // Destroy the session
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
        return res.status(500).json({ error: "Error during logout" });
      }
      return res.redirect("/");
    });
  } catch (e) {
    console.error('Logout error:', e);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

// =========================
// FAVORITES FEATURE BELOW
// =========================

// Get all favorite recipes for logged-in user
export const getFavorites = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id).populate("favorites");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user.favorites);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add a recipe to favorites
export const addFavorite = async (req, res) => {
  try {
    const recipeId = req.params.recipeId;
    const user = await userModel.findById(req.user.id);

    if (!user.favorites.includes(recipeId)) {
      user.favorites.push(recipeId);
      await user.save();
    }

    res.status(200).json({ message: "Added to favorites" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Remove a recipe from favorites
export const removeFavorite = async (req, res) => {
  try {
    const recipeId = req.params.recipeId;

    await userModel.findByIdAndUpdate(req.user.id, {
      $pull: { favorites: recipeId },
    });

    res.status(200).json({ message: "Removed from favorites" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Change password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Find user
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Error changing password' });
  }
};