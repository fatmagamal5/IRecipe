import jwt from 'jsonwebtoken';
import User from '../models/user.js';

// Verify if user is logged in
export const verifyToken = async (req, res, next) => {
  try {
    // Get token from cookies
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).render('error', { 
        error: 'Access Denied',
        message: 'You do not have permission to access this page',
        status: 403
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).render('error', { 
        error: 'Access Denied',
        message: 'You do not have permission to access this page',
        status: 403
      });
    }

    // Add user to request object
    req.user = user;
    // Update lastActive timestamp
    await User.findByIdAndUpdate(user._id, { lastActive: new Date() });
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).render('error', { 
      error: 'Access Denied',
      message: 'You do not have permission to access this page',
      status: 403
    });
  }
};

// Verify if user is admin
export const verifyAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(403).render('error', { 
        error: 'Access Denied',
        message: 'You do not have permission to access this page',
        status: 403
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
    res.status(403).render('error', { 
      error: 'Access Denied',
      message: 'You do not have permission to access this page',
      status: 403
    });
  }
};

// Session-based authentication middleware
export const verifySession = (req, res, next) => {
  if (req.session && req.session.user) {
    req.user = req.session.user;
    return next();
  }
  return res.status(401).render('error', {
    error: 'Access Denied',
    message: 'Please log in to access this page',
    status: 401
  });
};

export const verifySessionAdmin = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.role === 'admin') {
    req.user = req.session.user;
    return next();
  }
  return res.status(403).render('error', {
    error: 'Access Denied',
    message: 'You do not have permission to access this page',
    status: 403
  });
}; 