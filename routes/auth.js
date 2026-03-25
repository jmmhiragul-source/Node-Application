const express = require('express');
const { signup, login } = require('../controllers/auth');
const { checkSession, refreshSession, logout } = require('../controllers/session');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);

// Session management routes (require authentication)
router.get('/session', auth, checkSession);
// Refresh endpoint allows expired tokens
router.post('/session/refresh', auth.authWithExpiredToken, refreshSession);
router.post('/logout', auth, logout);

module.exports = router;
