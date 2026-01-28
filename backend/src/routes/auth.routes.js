import express from 'express';
<<<<<<< HEAD
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { passport } from '../auth.js';
import User from '../models/User.js';
=======
const router = express.Router();
import { passport } from '../auth.js'; // Updated path to auth.js
>>>>>>> 143da3edf3d107d1f46bc1afea7626b031408218

const router = express.Router();

// Helper to generate JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// --- AUTH API ---

// Local Register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, phone, region, bio } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

<<<<<<< HEAD
    const hashedPassword = await bcrypt.hash(password, 10);
=======
  if (req.user.role === 'Artisan') {
    profileInfo += '<p>You have access to Artisan-specific features!</p>';
  } else {
    profileInfo += '<p>You have access to Client-specific features.</p>';
  }

  profileInfo += '<a href="/">Home</a>';
  res.send(profileInfo);
});
>>>>>>> 143da3edf3d107d1f46bc1afea7626b031408218

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "CLIENT",
      phone,
      region,
      bio
    });

<<<<<<< HEAD
    res.status(201).json({
      message: "User registered successfully",
      token: generateToken(user),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
=======
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
      role: 'CLIENT' // Default
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
>>>>>>> 143da3edf3d107d1f46bc1afea7626b031408218
});

// Local Login (API)
router.post("/login", (req, res, next) => {
  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err || !user) {
      return res.status(400).json({
        message: info ? info.message : 'Login failed',
        user: user
      });
    }

    router.get('/auth/google/callback',
      passport.authenticate('google', { failureRedirect: '/login' }),
      (req, res) => {
        // Successful authentication, redirect home.
        res.redirect('/profile');
      }
    );

    // Facebook
    router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));

    router.get('/facebook/callback',
      passport.authenticate('facebook', { failureRedirect: process.env.FRONTEND_URL + '/login', session: false }),
      (req, res) => {
        const token = generateToken(req.user);
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?token=${token}&user=${encodeURIComponent(JSON.stringify({
          id: req.user._id,
          name: req.user.name || req.user.displayName,
          email: req.user.email,
          role: req.user.role
        }))}`);
      }
    );

    // --- Local Auth Route ---
    router.post('/login/password',
      passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }),
      (req, res) => {
        res.redirect('/profile');
      }
    );

    // --- Logout Route ---
    router.get('/logout', (req, res, next) => {
      req.logout(function (err) {
        if (err) { return next(err); }
        res.redirect('/');
      });
    });

    export default router;