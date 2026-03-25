const jwt = require('jsonwebtoken');
const { User, Session } = require('../models');

// Middleware that allows expired tokens (for refresh endpoint)
const authWithExpiredToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) return res.status(401).json({ error: 'No token provided' });

  const token = authHeader.split(' ')[1];
  let tokenExpired = false;
  try {
    // Decode without verification first to check expiration
    let decoded;
    try {
      decoded = jwt.verify(token, 'your-secret-key-change-this-in-production');
    } catch (verifyErr) {
      // If token is expired, decode without verification to get user info
      if (verifyErr.name === 'TokenExpiredError') {
        tokenExpired = true;
        decoded = jwt.decode(token);
        if (!decoded) throw new Error('Invalid token');
      } else {
        throw verifyErr;
      }
    }

    // User.findByPk is an operation
    const user = await User.findByPk(decoded.id);
    if (!user) throw new Error('User not found');

    // Check if session exists (even if expired)
    let session = await Session.findOne({ 
      where: { 
        token, 
        userId: decoded.id
      },
      order: [['createdAt', 'DESC']] // Get most recent session
    });

    // If no session found by exact token, try to find most recent session for user
    // This allows refresh even if the exact token's session was cleaned up
    if (!session && decoded.id) {
      session = await Session.findOne({
        where: {
          userId: decoded.id
        },
        order: [['createdAt', 'DESC']] // Get most recent session (even if inactive)
      });
    }

    req.user = user;
    req.session = session;
    req.tokenExpired = tokenExpired;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

// Standard auth middleware (does not allow expired tokens)
const auth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) return res.status(401).json({ error: 'No token provided' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, 'your-secret-key-change-this-in-production');

    // User.findByPk is an operation
    const user = await User.findByPk(decoded.id);
    if (!user) throw new Error();

    // Check if session exists and is active
    let session = await Session.findOne({ 
      where: { 
        token, 
        isActive: true,
        userId: decoded.id
      } 
    });

    // If no session exists but token is valid, create one (backward compatibility)
    if (!session) {
      // Calculate expiration time based on JWT expiration
      const expiresAt = new Date(decoded.exp * 1000); // JWT exp is in seconds
      
      // If token is already expired, don't create session
      if (new Date() > expiresAt) {
        return res.status(401).json({ error: 'Token expired' });
      }

      // Create session for valid token
      session = await Session.create({
        token,
        userId: decoded.id,
        expiresAt,
        isActive: true
      });
    }

    // Check if session has expired
    if (new Date() > new Date(session.expiresAt)) {
      // Mark session as inactive
      await session.update({ isActive: false });
      return res.status(401).json({ error: 'Session expired' });
    }

    req.user = user;
    req.session = session;
    next();
  } catch (err) {
    // Check if token is expired
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    res.status(401).json({ error: 'Unauthorized' });
  }
};

module.exports = auth;
module.exports.authWithExpiredToken = authWithExpiredToken;
