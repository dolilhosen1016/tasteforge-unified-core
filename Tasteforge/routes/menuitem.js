const express = require('express');
const router = express.Router();
const MenuItem = require('../models/menuitem'); // মডেল ইম্পোর্ট করা হলো

// 1. Get All Menus
router.get('/get-all', async (req, res) => {
    try {
        const menuItems = await MenuItem.find();
        res.status(200).json(menuItems);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Seed Menus (একসাথে JSON থেকে সব ডেটা ডাটাবেসে সেভ করার জন্য)
router.post('/seed', async (req, res) => {
    try {
        const count = await MenuItem.countDocuments();
        if (count > 0) {
            return res.status(400).json({ message: "Menu Items are already seeded!" });
        }

        await MenuItem.insertMany(req.body);
        res.status(201).json({ message: "All 24 Menu items added successfully!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;