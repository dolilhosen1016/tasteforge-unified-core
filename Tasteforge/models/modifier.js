const mongoose = require('mongoose');

const modifierSchema = new mongoose.Schema({
    menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
    name: { type: String, required: true }, // e.g., "Extra Cheese", "No Onion"
    actionType: { type: String, enum: ['Add', 'Remove'], required: true },
    
    // Add হলে পজিটিভ (+20), Remove হলে সাধারণত 0 বা নেগেটিভ (-10)
    priceChange: { type: Number, default: 0 }, 
    
    // Add হলে পজিটিভ (+50 ক্যালরি), Remove হলে নেগেটিভ (-30 ক্যালরি)
    calorieChange: { type: Number, default: 0 } 
}, { timestamps: true });

module.exports = mongoose.model('Modifier', modifierSchema);