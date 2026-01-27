import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { passport } from '../auth.js';
import User from '../models/User.js';

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

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || "CLIENT",
            phone,
            region,
            bio
        });

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

        req.login(user, { session: false }, (err) => {
            if (err) {
                res.send(err);
            }
            const token = generateToken(user);
            return res.json({
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
            });
        });
    })(req, res, next);
});

// --- Social Auth ---

// Google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: process.env.FRONTEND_URL + '/login', session: false }),
    (req, res) => {
        const token = generateToken(req.user);
        // Redirect back to frontend with token
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?token=${token}&user=${encodeURIComponent(JSON.stringify({
            id: req.user._id,
            name: req.user.name || req.user.displayName,
            email: req.user.email,
            role: req.user.role
        }))}`);
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

// Logout (API doesn't really need this if using JWT, but for completeness)
router.get('/logout', (req, res) => {
    res.json({ message: "Logout successful" });
});

export default router;