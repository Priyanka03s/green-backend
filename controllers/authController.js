import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/* =========================
   JWT TOKEN
========================= */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

/* =========================
   VALIDATION
========================= */
const validateRegistration = (data) => {
  const errors = [];

  if (!data.name || data.name.trim() === '') {
    errors.push('Name is required');
  }

  if (!data.email || !/\S+@\S+\.\S+/.test(data.email)) {
    errors.push('Please include a valid email');
  }

  if (!data.password || data.password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }

  return errors;
};

/* =========================
   REGISTER
========================= */
export const register = async (req, res) => {
  try {
    console.log('Registration started for:', req.body.email);
    const validationErrors = validateRegistration(req.body);
    if (validationErrors.length > 0) {
      console.log('Validation failed:', validationErrors[0]);
      return res.status(400).json({ message: validationErrors[0] });
    }

    let { name, email, password, phone } = req.body;
    email = email.toLowerCase().trim();

    console.log('Checking if user exists:', email);
    const userExists = await User.findOne({ email });
    if (userExists) {
      console.log(`Registration failed: Email already exists (${email})`);
      return res.status(400).json({ message: 'This email is already registered. Please Login instead of Signing Up.' });
    }

    console.log('Creating user in database...');
    const user = await User.create({
      name,
      email,
      phone,
      password, // Will be hashed by pre-save hook
      isAdmin: req.body.isAdmin || false,
      role: req.body.role || 'user'
    });

    console.log('User created, generating token...');
    const token = generateToken(user._id);

    console.log('Registration successful');
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      isAdmin: user.isAdmin,
      role: user.role,
      token,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error('CRITICAL Registration error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

/* =========================
   LOGIN
========================= */
export const login = async (req, res) => {
  try {
    let { email, password } = req.body;
    console.log(`Login attempt for: ${email}`);

    if (!email || !password) {
      console.log('Login failed: Missing email or password');
      return res.status(400).json({ message: 'Login failed: Both email and password are required.' });
    }

    email = email.toLowerCase().trim();
    // Do not trim password - spaces are valid characters in passwords

    const user = await User.findOne({ email });

    if (!user) {
      console.warn(`[AUTH] Login failed: User with email ${email} not found.`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log(`[AUTH] User found: ${user.name} (Role: ${user.role})`);

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      console.warn(`[AUTH] Login failed: Password mismatch for ${email}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log(`Login successful for: ${email}`);
    const token = generateToken(user._id);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      isAdmin: user.isAdmin,
      role: user.role,
      token,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error('CRITICAL Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/* =========================
   GOOGLE LOGIN
========================= */
export const googleLogin = async (req, res) => {
  try {
    const { tokenId } = req.body;

    if (!tokenId) {
      return res.status(400).json({ message: 'Token ID is required' });
    }

    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { name, email, picture, sub } = ticket.getPayload();

    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Create new user if not exists
      user = await User.create({
        name,
        email: email.toLowerCase(),
        password: Math.random().toString(36).slice(-10), // Random password for social logins
        role: 'user',
        isAdmin: false
      });
      console.log(`New user created via Google: ${email}`);
    } else {
      console.log(`User logged in via Google: ${email}`);
    }

    const token = generateToken(user._id);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      isAdmin: user.isAdmin,
      role: user.role,
      token,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error('GOOGLE Login error:', error);
    res.status(401).json({ message: 'Invalid Google token or verification failed' });
  }
};

/* =========================
   GET PROFILE
========================= */
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/* =========================
   UPDATE PROFILE
========================= */
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email ? req.body.email.toLowerCase() : user.email;
      user.phone = req.body.phone || user.phone;

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        isAdmin: updatedUser.isAdmin,
        role: updatedUser.role,
        token: generateToken(updatedUser._id),
        createdAt: updatedUser.createdAt,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

/* =========================
   GET ALL USERS (ADMIN)
========================= */
export const getAllUsers = async (req, res) => {
  try {
    // Fetch all users sorted by creation date (newest first)
    const users = await User.find({})
      .select('name email phone isAdmin role createdAt')
      .sort({ createdAt: -1 });

    console.log(`Fetched ${users.length} users`);
    res.json(users);
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/* =========================
   UPDATE ADDRESS (Legacy - keeping for backward compatibility)
========================= */
export const updateAddress = async (req, res) => {
  try {
    const { address, city, district, state, pincode, country } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.address = {
      address,
      city,
      district,
      state,
      pincode,
      country,
    };

    await user.save();

    res.json({
      message: 'Address updated successfully',
      address: user.address,
    });
  } catch (error) {
    console.error('Update address error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/* =========================
   GET ADDRESS BY USER ID (Legacy)
========================= */
export const getAddress = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).select('address');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.address || {});
  } catch (error) {
    console.error('Get address error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/* =========================
   GET CURRENT USER ADDRESS (Legacy)
========================= */
export const getMyAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('address');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.address || {});
  } catch (error) {
    console.error('Get my address error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};