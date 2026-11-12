const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const MenuItem = require('../models/menuitem'); 
const User = require('../models/user'); 

// ==========================================
// 1. Place a New Order 
// ==========================================
router.post('/place', async (req, res) => {
    try {
        const { userEmail, cartItems, totalAmount, orderType, tableNoOrTokenId } = req.body;

        const user = await User.findOne({ email: userEmail });

        const formattedItems = [];
        for (let item of cartItems) {
            const menuRecord = await MenuItem.findOne({ id: item.id }); 
            
            if (menuRecord) {
                formattedItems.push({
                    menuItem: menuRecord._id, 
                    quantity: item.quantity || 1, 
                    lineTotal: item.price || item.totalPrice
                });
            }
        }

        const newOrder = new Order({
            user: user ? user._id : null,
            userEmail: userEmail,
            tableNoOrTokenId: tableNoOrTokenId || `TOKEN-${Math.floor(Math.random() * 10000)}`,
            orderType: orderType || 'Online',
            totalAmount: totalAmount,
            items: formattedItems
        });

        await newOrder.save();
        res.status(201).json({ message: "Order placed successfully!", order: newOrder });

    } catch (error) {
        console.error("Order Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
// 2. Get Kitchen Orders (NEW: For KDS / Chef)
// শেফ শুধু 'Pending', 'Verified', এবং 'Preparing' অর্ডারগুলো দেখবে
// ==========================================
router.get('/kitchen', async (req, res) => {
    try {
        const orders = await Order.find({ status: { $in: ['Pending', 'Verified', 'Preparing'] } })
            .populate('items.menuItem', 'name') // খাবারের নাম দেখানোর জন্য
            .sort({ createdAt: 1 }); // পুরনো অর্ডার আগে দেখাবে
            
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
// 3. Get Cashier Pending Bills (NEW: For Cashier)
// ক্যাশিয়ার শুধু 'Cooked' হওয়া অর্ডারগুলো দেখবে
// ==========================================
router.get('/cashier', async (req, res) => {
    try {
        const orders = await Order.find({ status: 'Cooked' })
            .populate('items.menuItem', 'name')
            .sort({ createdAt: 1 });
            
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
// 4. Update Order Status (NEW: KDS & Cashier Action)
// শেফ 'Preparing' বা 'Cooked' করবে, ক্যাশিয়ার 'Handover' করবে
// ==========================================
router.put('/update-status/:id', async (req, res) => {
    try {
        const { status } = req.body;
        
        // স্ট্যাটাসটা তোমার enum এর মধ্যে আছে কিনা ভ্যালিডেশন
        const validStatuses = ['Pending', 'Verified', 'Preparing', 'Cooked', 'Handover'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: "Invalid status value!" });
        }

        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id, 
            { status }, 
            { new: true }
        );
        
        if (!updatedOrder) return res.status(404).json({ error: 'Order not found' });
        
        res.status(200).json({ message: `Order status updated to ${status}`, order: updatedOrder });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
// 5. Get My Orders 
// ==========================================
router.get('/my-orders/:email', async (req, res) => {
    try {
        const orders = await Order.find({ userEmail: req.params.email })
            .populate('items.menuItem', 'name imageUrl') 
            .sort({ createdAt: -1 });
            
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
// 6. Get All Orders
// ==========================================
router.get('/all', async (req, res) => {
    try {
        const orders = await Order.find().populate('items.menuItem', 'name').sort({ createdAt: -1 });
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;