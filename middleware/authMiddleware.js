import jwt from "jsonwebtoken";
import User from "../models/User.js";

/**
 * Protect routes - verify JWT token
 */
export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("JWT AUTH ERROR:", error.message);
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};

/**
 * Admin check middleware
 */
export const admin = (req, res, next) => {
  if (req.user && (req.user.isAdmin === true || req.user.role === "admin" || req.user.role === "superadmin")) {
    next();
  } else {
    return res.status(403).json({
      message: "Access denied. Admin privileges required"
    });
  }
};

/**
 * ✅ COMBINED ADMIN PROTECTION (THIS WAS MISSING)
 */
export const protectAdmin = [protect, admin];
