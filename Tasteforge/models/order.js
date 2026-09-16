const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
    variant: { type: mongoose.Schema.Types.ObjectId, ref: 'Variant' },
    quantity: { type: Number, required: true, min: 1 },
    lineTotal: { type: Number, required: true }
});

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional for offline kiosk users
    tableNoOrTokenId: { type: String, required: true },
    orderType: { type: String, enum: ['Kiosk', 'Waiter', 'Online'], required: true },
    status: { 
        type: String, 
        enum: ['Pending', 'Verified', 'Preparing', 'Cooked', 'Handover'], 
        default: 'Pending' 
    },
    totalAmount: { type: Number, required: true },
    items: [orderItemSchema]
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);