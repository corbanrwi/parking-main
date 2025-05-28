const User = require('../models/User');

// Authentication middleware
const authenticateUser = async (req, res, next) => {
    try {
        // Check if user is logged in via session
        if (!req.session || !req.session.userId) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required. Please login first.'
            });
        }

        // Get user details from database
        const user = await User.findById(req.session.userId);
        
        if (!user) {
            // Clear invalid session
            req.session.destroy();
            return res.status(401).json({
                success: false,
                message: 'Invalid session. Please login again.'
            });
        }

        // Add user to request object
        req.user = user;
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        return res.status(500).json({
            success: false,
            message: 'Authentication error',
            error: error.message
        });
    }
};

// Authorization middleware for admin only
const requireAdmin = (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }

        next();
    } catch (error) {
        console.error('Authorization error:', error);
        return res.status(500).json({
            success: false,
            message: 'Authorization error',
            error: error.message
        });
    }
};

// Authorization middleware for manager and admin
const requireManagerOrAdmin = (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        if (!['admin', 'manager'].includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Manager or Admin access required'
            });
        }

        next();
    } catch (error) {
        console.error('Authorization error:', error);
        return res.status(500).json({
            success: false,
            message: 'Authorization error',
            error: error.message
        });
    }
};

// Optional authentication (for public endpoints that can benefit from user info)
const optionalAuth = async (req, res, next) => {
    try {
        if (req.session && req.session.userId) {
            const user = await User.findById(req.session.userId);
            if (user) {
                req.user = user;
            }
        }
        next();
    } catch (error) {
        // Don't fail on optional auth errors
        console.error('Optional auth error:', error);
        next();
    }
};

module.exports = {
    authenticateUser,
    requireAdmin,
    requireManagerOrAdmin,
    optionalAuth
};
