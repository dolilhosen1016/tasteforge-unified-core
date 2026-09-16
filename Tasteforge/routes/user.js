const express = require('express');
const router = express.Router();
const User = require('../models/user'); // আমাদের ইউজার মডেল

// 1. Register Route
router.post('/register', async (req, res) => {
    try {
        const { name, email, passwordHash, role } = req.body;

        
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists with this email!' });
        }

        
        const newUser = new User({
            name,
            email,
            passwordHash, 
            role: role || 'Customer'
        });

        await newUser.save();
        res.status(201).json({ message: 'User registered successfully!', user: newUser });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Login Route
router.post('/login', async (req, res) => {
    try {
        const { email, passwordHash } = req.body;

        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'User not found!' });
        }

        
        if (user.passwordHash !== passwordHash) {
            return res.status(400).json({ error: 'Invalid credentials!' });
        }

        res.status(200).json({ message: 'Login successful!', user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;