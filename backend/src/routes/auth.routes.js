import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { passport } from '../auth.js';
import User from '../models/User.js';
import { forgotPassword, resetPassword } from '../controllers/auth.controller.js';

const router = express.Router();

// Middleware to check if the user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
};

// --- Main Routes ---
router.get('/', (req, res) => {
  let userGreeting = 'Welcome, Guest!';
  if (req.isAuthenticated()) {
    userGreeting = `Welcome, ${req.user.name}! (${req.user.role.join(', ')})`;
  }
  res.send(`
    <h1>Artisanal Platform</h1>
    <p>${userGreeting}</p>
    <ul>
      ${req.isAuthenticated() ? `
        <li><a href="/profile">View Profile</a></li>
        <li><a href="/logout">Logout</a></li>
      ` : `
        <li><a href="/login">Login</a></li>
        <li><a href="/signup">Sign Up</a></li>
        <li><a href="/auth/google">Login with Google</a></li>
        <li><a href="/auth/facebook">Login with Facebook</a></li>
      `}
    </ul>
  `);
});

router.get('/login', (req, res) => {
  res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`);
});

// --- Profile Route ---
router.get('/profile', isAuthenticated, (req, res) => {
  let profileInfo = `
    <h2>Welcome to your profile, ${req.user.name}</h2>
    <p>Your ID: ${req.user.id}</p>
    <p>Your Role: ${req.user.role.join(', ')}</p>
    <p>Provider: ${req.user.provider || 'local'}</p>
  `;

  if (req.user.role.includes('ARTISAN')) {
    profileInfo += '<p>You have access to Artisan-specific features!</p>';
  }

  if (req.user.role.includes('CLIENT')) {
    profileInfo += '<p>You have access to Client-specific features.</p>';
  }

  profileInfo += '<a href="/">Home</a>';
  res.send(profileInfo);
});

// --- Signup Routes ---
router.get('/signup', (req, res) => {
  res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/register`);
});

router.post('/signup', async (req, res, next) => {
  const { firstName, lastName, email, phone, password } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newUser = new User({
      name: `${firstName} ${lastName}`,
      email: email,
      phone: phone,
      password: password,
      role: ['CLIENT']
    });

    await newUser.save();

    req.login(newUser, (err) => {
      if (err) {
        return next(err);
      }
      return res.redirect('/profile');
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// --- Social Callback Handler ---
const handleSocialCallback = (req, res) => {
  const user = req.user;

  // Generate JWT token
  const token = jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  // Redirect to frontend with token and user info
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const redirectUrl = `${frontendUrl}/#/login-success?token=${token}&user=${encodeURIComponent(JSON.stringify({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isApproved: user.isApproved
  }))}`;

  res.redirect(redirectUrl);
};

// --- Google Auth Routes ---
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  handleSocialCallback
);

// --- Facebook Auth Routes ---
router.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email'] }));

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

// --- Password Reset Routes ---
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

export default router;
