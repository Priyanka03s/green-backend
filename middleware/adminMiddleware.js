import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const adminMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid token.' });
    }
    
    // Check if user is admin
    if (!user.isAdmin && user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(401).json({ message: 'Invalid token.' });
  }
};