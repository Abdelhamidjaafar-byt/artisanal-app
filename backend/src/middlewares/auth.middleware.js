export const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ message: "Not authenticated" });
};

export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.isAuthenticated()) {
            return res.status(401).json({ message: "Not authenticated" });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: "Access denied" });
        }
        next();
    };
};
