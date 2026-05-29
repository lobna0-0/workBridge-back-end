
exports.allowRoles = (...roles) => {
    return (req, res, next) => {
        try {
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: "Forbidden" });
        }

        next();
        } catch (err) {
        res.status(500).json({ error: err.message });
        }
    };
};