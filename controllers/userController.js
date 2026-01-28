import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

const validateRegistration = (data) => {
  const errors = [];
  if (!data.name || data.name.trim() === '') errors.push('Name is required');
  if (!data.email || !/\S+@\S+\.\S+/.test(data.email))
    errors.push('Please include a valid email');
  if (!data.password || data.password.length < 6)
    errors.push('Password must be at least 6 characters');
  return errors;
};

export const register = async (req, res) => {
  try {
    const errors = validateRegistration(req.body);
    if (errors.length) return res.status(400).json({ message: errors[0] });

    const { name, email, password, phone } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ 
      name, 
      email, 
      phone, 
      password: hashedPassword,
      isAdmin: false,
      role: 'user'
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      isAdmin: user.isAdmin,
      role: user.role,
      token: generateToken(user._id),
      createdAt: user.createdAt,
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Please provide email and password' });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      isAdmin: user.isAdmin,
      role: user.role,
      token: generateToken(user._id),
      createdAt: user.createdAt,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ ADD THIS NEW FUNCTION
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error('Get all users error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};