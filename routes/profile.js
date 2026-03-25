const express = require('express');
const auth = require('../middleware/auth');
const { getProfile , updateProfile,deleteProfile } = require('../controllers/profile');
const router = express.Router();

router.get('/', auth, getProfile);
router.put('/', auth, updateProfile);
router.delete('/', auth, deleteProfile);

module.exports = router;
