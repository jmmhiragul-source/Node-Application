const {
    User,
    Session
} = require("../models");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getExpirationDate } = require('../utils/jwt');

module.exports = {
    signup: async (req, res) => {
        const { username, password, email } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        try {
            // User.findOne is an opetaion 
            const existingUser = await User.findOne({ where: { username } });
            if (existingUser) {
                return res.status(400).json({ error: 'Username already taken' });
            }

             // User.create is an opetaion 
            const user = await User.create({ username, password, email });
            res.json({ message: 'User created successfully', userId: user.id });
        } catch (err) {
            res.status(500).json({ error: 'Failed to create user' });
        }
    },

    login: async (req, res) => {
        const { username, password } = req.body;

         // User.findOne is an opetaion 
        const user = await User.findOne({ where: { username } });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '1h';
        const token = jwt.sign(
            { id: user.id }, 
            process.env.JWT_SECRET || 'secretkey', 
            { expiresIn: jwtExpiresIn }
        );
        
        // Calculate expiration time based on JWT_EXPIRES_IN
        const expiresAt = getExpirationDate(jwtExpiresIn);
        
        // Create session record
        await Session.create({
            token,
            userId: user.id,
            expiresAt,
            isActive: true
        });
        
        res.json({ token, expiresAt });
    }
};