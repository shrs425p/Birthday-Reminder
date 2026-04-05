// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET;

if (!SECRET) {
    throw new Error('Missing required environment variable: JWT_SECRET');
}

const requireAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Access Denied: No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, SECRET);
        req.user = decoded; // Attach user info (username, role) to the request
        next();
    } catch (err) {
        return res.status(403).json({ success: false, message: 'Access Denied: Invalid or expired token' });
    }
};

const requireAdmin = (req, res, next) => {
    // Must run after requireAuth
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Access Denied: Requires Admin role' });
    }
    next();
};

module.exports = {
    requireAuth,
    requireAdmin,
    SECRET
};
