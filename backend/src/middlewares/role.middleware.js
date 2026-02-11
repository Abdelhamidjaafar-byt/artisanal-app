const role = (...allowedRoles) => {
    return (req, res, next) => {
        const userRoles = Array.isArray(req.user.role) ? req.user.role : [req.user.role];
        const hasPermission = allowedRoles.some(r => userRoles.includes(r));

        if (!req.user || !hasPermission) {
            return res.status(403).json({ message: "Access denied: insufficient permissions" });
        }
        next();
    };
};

export default role;
