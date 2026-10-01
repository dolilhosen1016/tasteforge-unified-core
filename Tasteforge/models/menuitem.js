const mongoose = require('mongoose');

// Ingredients er structure
const ingredientSchema = new mongoose.Schema({
    name: { type: String },
    defaultQty: { type: Number },
    minQty: { type: Number },
    maxQty: { type: Number },
    extraPrice: { type: Number },
    extraCalories: { type: Number }
});

// Main Menu Item er structure 
const menuItemSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true }, 
    name: { type: String, required: true },
    description: { type: String, required: true },
    longDescription: { type: String },
    calories: { type: Number, required: true },
    price: { type: Number, required: true }, // basePrice er bodole price
    category: { type: String, required: true },
    imageUrl: { type: String, required: true },
    ingredients: [ingredientSchema] // Ingredients array
}, { timestamps: true });

module.exports = mongoose.model('MenuItem', menuItemSchema);