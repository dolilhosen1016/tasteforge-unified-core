const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
    menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
    ingredientName: { type: String, required: true },
    stockQuantity: { type: Number, required: true, min: 0 },
    unit: { type: String, required: true } // e.g., "kg", "grams", "pieces"
}, { timestamps: true });

module.exports = mongoose.model('Inventory', inventorySchema);