const {
  User
} = require("../models");
const bcrypt = require('bcrypt');

module.exports = {
  getProfile: async (req, res) => {
    res.json({ user: req.user });
  },
  updateProfile: async (req, res) => {
    const { username, email, password } = req.body;

    try {
      if (username) req.user.username = username;
      if (email) req.user.email = email;
      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        req.user.password = hashedPassword;
      }

      await req.user.save();
      res.json({ message: 'Profile updated successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update profile' });
    }
  },
  deleteProfile: async (req, res) => {
    await req.user.destroy();
    res.json({ message: 'Profile deleted' });
  }


};