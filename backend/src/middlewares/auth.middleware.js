import jwt from 'jsonwebtoken';

export const isAuthenticated = (req, res, next) => {

    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ message: "Not authenticated" });
};

// Middleware to authorize roles
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.some(role => req.user.role.includes(role))) {
            res.status(403);
            return next(new Error("Access Denied. You do not have the required role."));
        }
        next();
    };
};

// Middleware to check if user is approved (for artisans)
export const checkApproved = async (req, res, next) => {
    try {
        // Find user to get the latest isApproved status
        const user = await import("../models/User.js").then(m => m.default.findById(req.user.id));

        if (!user) {
            res.status(404);
            throw new Error("User not found");
        }

        // If user is artisan but not approved, block access
        if (user.role.includes("ARTISAN") && !user.isApproved) {
            res.status(403);
            throw new Error("Account not approved. Please wait for admin approval.");
        }

        next();
    } catch (error) {
        next(error);
    }
};

export const verifyToken = (req, res, next) => {
    const authHeader = req.header("Authorization");
    let token = authHeader?.split(" ")[1];

    if (token) {
        // Clean token: Remove quotes, "token:" prefix, and whitespace
        token = token.replace(/"token":\s*/g, '')
            .replace(/["']/g, '')
            .trim();
    }

    if (!token) {
        res.status(401);
        throw new Error("Access Denied. No token provided.");
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (error) {
        res.status(400);
        throw new Error("Invalid Token");
    }
};
