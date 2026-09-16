const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
    menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
    variantName: { type: String, required: true }, // e.g., "Adult Portion", "Child Portion"
    priceModifier: { type: Number, required: true } // How much to add/subtract from basePrice
}, { timestamps: true });

module.exports = mongoose.model('Variant', variantSchema);