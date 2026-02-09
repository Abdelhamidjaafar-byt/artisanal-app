import express from 'express';
const router = express.Router();
import { passport } from '../auth.js'; // Updated path to auth.js

// Middleware to check if the user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
};

// --- Main Routes ---
router.get('/', (req, res) => {
  res.redirect(process.env.FRONTEND_URL || 'http://localhost:5173');
});

router.get('/login', (req, res) => {
  res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`);
});

// --- Profile Route ---
router.get('/profile', isAuthenticated, (req, res) => {
  res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/profile`);
});

// --- Signup Routes ---
router.get('/signup', (req, res) => {
  res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/register`);
});

import User from '../models/User.js';

router.post('/signup', async (req, res, next) => {
  const { firstName, lastName, email, phone, password } = req.body;
  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      // Ideally show an error message
      return res.redirect('/login');
    }

    const newUser = new User({
      name: `${firstName} ${lastName}`, // User model uses 'name'
      email: email,
      phone: phone,
      password: password, // In a real app, hash and salt this password
      role: ['CLIENT'] // Default
    });

    await newUser.save();

    req.login(newUser, (err) => {
      if (err) {
        return next(err);
      }
      return res.redirect('/profile');
    });
  } catch (err) {
    return next(err);
  }
});

import jwt from 'jsonwebtoken';

// --- Google Auth Routes ---
const handleSocialCallback = (req, res) => {
  const user = req.user;

  // Generate JWT for the React frontend
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  // Encode user data as a JSON string and then to base64 to avoid URL issues
  const userData = JSON.stringify({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isApproved: user.isApproved
  });

  const encodedUser = Buffer.from(userData).toString('base64');

  // Redirect to frontend success page
  res.redirect(`${process.env.FRONTEND_URL}/login-success?token=${token}&user=${encodedUser}`);
};

router.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  handleSocialCallback
);

// --- Facebook Auth Routes ---
router.get('/auth/facebook', passport.authenticate('facebook'));

router.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  handleSocialCallback
);

// --- Local Auth Route ---
router.post('/login/password',
  passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }),
  handleSocialCallback
);

// --- Logout Route ---
router.get('/logout', (req, res, next) => {
  req.logout(function (err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

export default router;