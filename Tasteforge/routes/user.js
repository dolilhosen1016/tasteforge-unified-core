const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

// 1. Register Route (Local)
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
            passwordHash: hashedPassword, 
            role: role || 'user' // ⚠️ 'Customer' এর বদলে স্কিমা অনুযায়ী 'user' করা হলো
        });

        await newUser.save();
        res.status(201).json({ message: 'User registered successfully!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Login Route (Local)
router.post('/login', async (req, res) => {
    try {
        const { email, passwordHash } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'User not found!' });
        }
        
        // সোশ্যাল লগইন ইউজার যদি পাসওয়ার্ড দিয়ে ঢোকার চেষ্টা করে
        if (!user.passwordHash) {
            return res.status(400).json({ error: 'Please login using your Google or GitHub account.' });
        }

        // ডাটাবেসের হ্যাশড পাসওয়ার্ডের সাথে ইউজারের দেওয়া পাসওয়ার্ড মিলানো
        const isMatch = await bcrypt.compare(passwordHash, user.passwordHash);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials!' });
        }

        // JWT টোকেন তৈরি করা 
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET || 'tasteforge_super_secret_key_2026',
            { expiresIn: '1d' } 
        );

        res.status(200).json({ 
            message: 'Login successful!', 
            token, 
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Social Login Sync Route (Google, GitHub, Facebook)
router.post('/social-login', async (req, res) => {
    try {
        const { name, email, socialId, authProvider } = req.body;

        // চেক করা ইউজার আগে থেকে আছে কি না
        let user = await User.findOne({ email });

        if (!user) {
            // নতুন ইউজার হলে ডাটাবেসে সেভ করা
            user = new User({
                name: name || 'TasteForge User',
                email,
                authProvider: authProvider || 'google',
                socialId: socialId,
                role: 'user' // সোশ্যাল লগইনে ডিফল্ট রোল 'user'
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
            message: `${authProvider} Login successful!`, 
            token: jwtToken, 
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (err) {
        res.status(500).json({ error: 'Social authentication failed', details: err.message });
    }
});

// 4. Create Staff Route (Admin Panel)
router.post('/create-staff', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ error: "Email already exists!" });

        // ⚠️ স্টাফ একাউন্টের পাসওয়ার্ডও হ্যাশ করে ডাটাবেসে রাখা হচ্ছে
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newStaff = new User({ 
            name, 
            email, 
            passwordHash: hashedPassword, 
            role 
        });
        
        await newStaff.save();
        res.status(201).json({ message: `${role} account created successfully!` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;