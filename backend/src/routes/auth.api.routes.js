import express from "express";
import { body, validationResult } from "express-validator";
import { login, register } from "../controllers/auth.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

import { loginRateLimiter } from "../middlewares/rate-limiter.middleware.js";

const router = express.Router();

// Validation middleware
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

router.post(
    "/register",
    [
        body("name").trim().notEmpty().withMessage("Name is required"),
        body("username").trim().notEmpty().withMessage("Username is required"),
        body("email").isEmail().withMessage("Please enter a valid email").normalizeEmail(),
        body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
        validate
    ],
    register
);

router.post(
    "/login",
    loginRateLimiter,
    [
        body("email").isEmail().withMessage("Please enter a valid email").normalizeEmail(),
        body("password").notEmpty().withMessage("Password is required"),
        validate
    ],
    login
);
router.get("/test", verifyToken, (req, res) => {
    res.json({ message: "JWT is working!", user: req.user });
});

export default router;
