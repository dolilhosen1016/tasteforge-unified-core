const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const MenuItem = require('../models/menuitem'); // মেনু থেকে ObjectId খোঁজার জন্য
const User = require('../models/user'); // ইউজার খোঁজার জন্য

// 1. Place a New Order
router.post('/place', async (req, res) => {
    try {
        const { userEmail, cartItems, totalAmount, orderType, tableNoOrTokenId } = req.body;

        // ১. ইমেইল দিয়ে ডাটাবেস থেকে ইউজারের ObjectId বের করা
        const user = await User.findOne({ email: userEmail });

        // ২. কার্টের আইটেমগুলোকে তোমার প্রফেশনাল orderItemSchema অনুযায়ী সাজানো
        const formattedItems = [];
        for (let item of cartItems) {
            // কার্টের id দিয়ে আসল মেনুর ObjectId বের করা
            const menuRecord = await MenuItem.findOne({ id: item.id }); 
            
            if (menuRecord) {
                formattedItems.push({
                    menuItem: menuRecord._id, // MongoDB এর অরিজিনাল ObjectId
                    quantity: 1, // আপাতত প্রতিটা আইটেমের কোয়ান্টিটি ১ ধরছি
                    lineTotal: item.price || item.totalPrice
                });
            }
        }

        // ৩. অর্ডার তৈরি করা
        const newOrder = new Order({
            user: user ? user._id : null,
            userEmail: userEmail,
            tableNoOrTokenId: tableNoOrTokenId || `TOKEN-${Math.floor(Math.random() * 10000)}`,
            orderType: orderType || 'Online',
            totalAmount: totalAmount,
            items: formattedItems
        });

        // ৪. ডাটাবেসে সেভ করা
        await newOrder.save();
        res.status(201).json({ message: "Order placed successfully!", order: newOrder });

    } catch (error) {
        console.error("Order Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// 2. Get My Orders
router.get('/my-orders/:email', async (req, res) => {
    try {
        // .populate() ব্যবহার করে অর্ডারের সাথে খাবারের নাম ও ছবিও ফ্রন্টএন্ডে পাঠিয়ে দেব
        const orders = await Order.find({ userEmail: req.params.email })
            .populate('items.menuItem', 'name imageUrl') 
            .sort({ createdAt: -1 });
            
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/all', async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;