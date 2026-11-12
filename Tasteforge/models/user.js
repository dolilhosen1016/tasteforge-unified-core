const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String }, // গুগল/গিটহাব লগিনের জন্য অপশনাল
    role: { 
        type: String, 
        enum: ['user', 'admin', 'chef', 'waiter', 'cashier'], 
        default: 'user' 
    },
    authProvider: { 
        type: String, 
        enum: ['local', 'google', 'facebook', 'github'], 
        default: 'local' 
    },
    socialId: { type: String } // গুগল/ফেসবুক/গিটহাবের আইডি
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);