const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

// 1. Register Route (With Password Hashing)
router.post('/register', async (req, res) => {
    try {
        const { name, email, passwordHash, role } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists with this email!' });
        }

        // পাসওয়ার্ড হ্যাশ (এনক্রিপ্ট) করা
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(passwordHash, salt);

        const newUser = new User({
            name,
            email,
            passwordHash: hashedPassword, // এনক্রিপ্ট করা পাসওয়ার্ড ডাটাবেসে সেভ হবে
            role: role || 'Customer'
        });

        await newUser.save();
        res.status(201).json({ message: 'User registered successfully!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Login Route (With JWT Token Generation)
router.post('/login', async (req, res) => {
    try {
        const { email, passwordHash } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'User not found!' });
        }

        // ডাটাবেসের হ্যাশড পাসওয়ার্ডের সাথে ইউজারের দেওয়া পাসওয়ার্ড মিলানো
        const isMatch = await bcrypt.compare(passwordHash, user.passwordHash);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials!' });
        }

        // JWT টোকেন তৈরি করা (এটা ইউজারের ডিজিটাল আইডি কার্ড)
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET || 'tasteforge_super_secret_key_2026',
            { expiresIn: '1d' } // ১ দিন পর টোকেন এক্সপায়ার হয়ে যাবে
        );

        res.status(200).json({ 
            message: 'Login successful!', 
            token, // রেসপন্সে টোকেন পাঠিয়ে দেওয়া হলো
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID); // পরে আমরা .env তে এটা বসাবো

// 3. Google Login/Signup Route
router.post('/google', async (req, res) => {
    try {
        const { token } = req.body; // ফ্রন্টএন্ড থেকে গুগলের টোকেন আসবে

        // গুগলের কাছে টোকেন ভেরিফাই করা
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        
        const payload = ticket.getPayload();
        const { sub: googleId, email, name } = payload;

        // চেক করা ইউজার আগে থেকে আছে কি না
        let user = await User.findOne({ email });

        if (!user) {
            // নতুন ইউজার হলে ডাটাবেসে সেভ করা
            user = new User({
                name,
                email,
                authProvider: 'google',
                socialId: googleId,
                role: 'Customer'
            });
            await user.save();
        }

        // আমাদের নিজেদের JWT টোকেন জেনারেট করা
        const jwtToken = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET || 'tasteforge_super_secret_key_2026',
            { expiresIn: '1d' }
        );

        res.status(200).json({ 
            message: 'Google Login successful!', 
            token: jwtToken, 
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (err) {
        res.status(500).json({ error: 'Google authentication failed', details: err.message });
    }
});

module.exports = router;