import jwt from 'jsonwebtoken';
import User from '../models/user.js';

// Verify if user is logged in
export const verifyToken = async (req, res, next) => {
  try {
    // Get token from cookies
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid token. User not found.' });
    }

    // Add user to request object
    req.user = user;
    // Update lastActive timestamp
    await User.findByIdAndUpdate(user._id, { lastActive: new Date() });
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Invalid token.' });
  }
};

// Verify if user is admin
export const verifyAdmin = async (req, res, next) => {
  try {
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

    next();
  } catch (error) {
    console.error('Admin verification error:', error);
    res.status(500).render('error', { 
      error: 'Server Error',
      message: 'An error occurred while verifying admin access',
      status: 500
    });
  }
}; 