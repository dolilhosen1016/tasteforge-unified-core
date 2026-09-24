const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String }, // এটা এখন অপশনাল (কারণ গুগল লগিনে পাসওয়ার্ড লাগবে না)
    role: { 
        type: String, 
        enum: ['Admin', 'Chef', 'Cashier', 'Waiter', 'Customer'], 
        default: 'Customer' 
    },
    authProvider: { 
        type: String, 
        enum: ['local', 'google', 'facebook'], 
        default: 'local' 
    },
    socialId: { type: String } // গুগল বা ফেসবুকের ইউনিক আইডি সেভ করার জন্য
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);