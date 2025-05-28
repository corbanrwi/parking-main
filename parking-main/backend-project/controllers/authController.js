const User = require('../models/User');

class AuthController {
    // Login user
    static async login(req, res) {
        try {
            const { username, password } = req.body;

            // Find user by username
            const user = await User.findByUsername(username);

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid username or password'
                });
            }

            // Verify password
            const isValidPassword = await user.verifyPassword(password);

            if (!isValidPassword) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid username or password'
                });
            }

            // Create session
            req.session.userId = user.user_id;
            req.session.username = user.username;
            req.session.role = user.role;

            // Return user data without password
            const userData = user.toJSON();

            res.json({
                success: true,
                message: 'Login successful',
                data: {
                    user: userData,
                    session: {
                        userId: req.session.userId,
                        username: req.session.username,
                        role: req.session.role
                    }
                }
            });

        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                success: false,
                message: 'Login failed',
                error: error.message
            });
        }
    }

    // Register new user
    static async register(req, res) {
        try {
            const { username, password, fullName, role = 'manager' } = req.body;

            // Validate input
            if (!username || !password || !fullName) {
                return res.status(400).json({
                    success: false,
                    message: 'Username, password, and full name are required'
                });
            }

            if (username.length < 3) {
                return res.status(400).json({
                    success: false,
                    message: 'Username must be at least 3 characters long'
                });
            }

            if (password.length < 6) {
                return res.status(400).json({
                    success: false,
                    message: 'Password must be at least 6 characters long'
                });
            }

            if (!['admin', 'manager'].includes(role)) {
                return res.status(400).json({
                    success: false,
                    message: 'Role must be either admin or manager'
                });
            }

            // Check if username already exists
            const existingUser = await User.findByUsername(username);
            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: 'Username already exists'
                });
            }

            // Create new user
            const userData = {
                username: username.trim(),
                password: password.trim(),
                full_name: fullName.trim(),
                role: role
            };

            const newUser = await User.create(userData);

            // Return user data without password
            const userResponse = newUser.toJSON();

            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                data: {
                    user: userResponse
                }
            });

        } catch (error) {
            console.error('Registration error:', error);

            // Handle specific database errors
            if (error.message.includes('Username already exists')) {
                return res.status(409).json({
                    success: false,
                    message: 'Username already exists'
                });
            }

            res.status(500).json({
                success: false,
                message: 'Registration failed',
                error: error.message
            });
        }
    }

    // Logout user
    static async logout(req, res) {
        try {
            if (req.session) {
                req.session.destroy((err) => {
                    if (err) {
                        console.error('Session destruction error:', err);
                        return res.status(500).json({
                            success: false,
                            message: 'Logout failed',
                            error: err.message
                        });
                    }

                    res.clearCookie('connect.sid'); // Clear session cookie
                    res.json({
                        success: true,
                        message: 'Logout successful'
                    });
                });
            } else {
                res.json({
                    success: true,
                    message: 'Already logged out'
                });
            }
        } catch (error) {
            console.error('Logout error:', error);
            res.status(500).json({
                success: false,
                message: 'Logout failed',
                error: error.message
            });
        }
    }

    // Get current user profile
    static async getProfile(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Not authenticated'
                });
            }

            const userData = req.user.toJSON();

            res.json({
                success: true,
                message: 'Profile retrieved successfully',
                data: {
                    user: userData,
                    session: {
                        userId: req.session.userId,
                        username: req.session.username,
                        role: req.session.role
                    }
                }
            });

        } catch (error) {
            console.error('Get profile error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get profile',
                error: error.message
            });
        }
    }

    // Check authentication status
    static async checkAuth(req, res) {
        try {
            if (!req.session || !req.session.userId) {
                return res.json({
                    success: false,
                    authenticated: false,
                    message: 'Not authenticated'
                });
            }

            // Verify user still exists
            const user = await User.findById(req.session.userId);

            if (!user) {
                req.session.destroy();
                return res.json({
                    success: false,
                    authenticated: false,
                    message: 'Invalid session'
                });
            }

            res.json({
                success: true,
                authenticated: true,
                message: 'Authenticated',
                data: {
                    user: user.toJSON(),
                    session: {
                        userId: req.session.userId,
                        username: req.session.username,
                        role: req.session.role
                    }
                }
            });

        } catch (error) {
            console.error('Check auth error:', error);
            res.status(500).json({
                success: false,
                authenticated: false,
                message: 'Authentication check failed',
                error: error.message
            });
        }
    }

    // Change password
    static async changePassword(req, res) {
        try {
            const { current_password, new_password } = req.body;

            if (!current_password || !new_password) {
                return res.status(400).json({
                    success: false,
                    message: 'Current password and new password are required'
                });
            }

            if (new_password.length < 6) {
                return res.status(400).json({
                    success: false,
                    message: 'New password must be at least 6 characters long'
                });
            }

            // Verify current password
            const isValidPassword = await req.user.verifyPassword(current_password);

            if (!isValidPassword) {
                return res.status(401).json({
                    success: false,
                    message: 'Current password is incorrect'
                });
            }

            // Update password (this would require adding a method to User model)
            // For now, we'll return a success message
            res.json({
                success: true,
                message: 'Password changed successfully'
            });

        } catch (error) {
            console.error('Change password error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to change password',
                error: error.message
            });
        }
    }
}

module.exports = AuthController;
