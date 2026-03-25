const { Session } = require('../models');
const jwt = require('jsonwebtoken');
const { getExpirationDate } = require('../utils/jwt');

module.exports = {
    // Check current session status
    checkSession: async (req, res) => {
        try {
            const session = req.session;
            const now = new Date();
            const expiresAt = new Date(session.expiresAt);
            const isExpired = now > expiresAt;
            const timeUntilExpiry = isExpired ? 0 : Math.max(0, expiresAt - now);

            res.json({
                isActive: session.isActive && !isExpired,
                expiresAt: session.expiresAt,
                createdAt: session.createdAt,
                timeUntilExpiry: Math.floor(timeUntilExpiry / 1000), // seconds
                isExpired
            });
        } catch (err) {
            res.status(500).json({ error: 'Failed to check session' });
        }
    },

    // Refresh token and extend session
    refreshSession: async (req, res) => {
        try {
            const session = req.session;
            const user = req.user;
            const tokenExpired = req.tokenExpired || false;

            // If no session found, return error
            if (!session) {
                return res.status(401).json({ error: 'No active session found. Please login again.' });
            }

            // Allow refresh if token expired but session exists (within reasonable time)
            // Check if session expired more than 24 hours ago - if so, require re-login
            const sessionExpiredAt = new Date(session.expiresAt);
            const now = new Date();
            const hoursSinceExpiry = (now - sessionExpiredAt) / (1000 * 60 * 60);
            
            // If session expired more than 24 hours ago, require re-login
            if (hoursSinceExpiry > 24) {
                if (session) {
                    await session.update({ isActive: false });
                }
                return res.status(401).json({ error: 'Session expired too long ago. Please login again.' });
            }

            // Generate new token
            const jwtExpiresIn = '1m';
            const newToken = jwt.sign(
                { id: user.id },
                'your-secret-key-change-this-in-production',
                { expiresIn: jwtExpiresIn }
            );
            
            // Calculate new expiration time based on JWT_EXPIRES_IN
            const expiresAt = getExpirationDate(jwtExpiresIn);

            // Deactivate old session if it exists
            if (session) {
                await session.update({ isActive: false });
            }

            // Create new session
            const newSession = await Session.create({
                token: newToken,
                userId: user.id,
                expiresAt,
                isActive: true
            });

            res.json({ 
                token: newToken, 
                expiresAt: newSession.expiresAt,
                message: 'Session refreshed successfully'
            });
        } catch (err) {
            console.error('Refresh session error:', err);
            res.status(500).json({ error: 'Failed to refresh session' });
        }
    },

    // Logout - invalidate session
    logout: async (req, res) => {
        try {
            const session = req.session;
            await session.update({ isActive: false });
            res.json({ message: 'Logged out successfully' });
        } catch (err) {
            res.status(500).json({ error: 'Failed to logout' });
        }
    }
};

