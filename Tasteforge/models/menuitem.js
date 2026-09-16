const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    basePrice: { type: Number, required: true },
    category: { type: String, required: true },
    

    calories: { type: Number }, // e.g., 250 
    protein: { type: Number },  // e.g., 15 
    
    isAvailable: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('MenuItem', menuItemSchema);