import jwt from 'jsonwebtoken';

export const isAuthenticated = (req, res, next) => {

    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ message: "Not authenticated" });
};

export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: "Not authenticated" });
        }
        if (!roles.some(role => req.user.role.includes(role))) {
            return res.status(403).json({ message: "Access denied" });
        }
        next();
    };
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
