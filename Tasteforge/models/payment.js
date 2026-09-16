const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    amount: { type: Number, required: true },
    paymentMethod: { 
        type: String, 
        enum: ['Cash', 'Card', 'Mobile Banking', 'Online Gateway'], 
        required: true 
    },
    paymentStatus: { 
        type: String, 
        enum: ['Pending', 'Completed', 'Failed', 'Refunded'], 
        default: 'Pending' 
    },
    transactionId: { type: String } // অনলাইনের ট্রানজেকশন আইডি
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);