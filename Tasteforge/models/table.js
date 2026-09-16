const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
    tableNumber: { type: Number, required: true, unique: true },
    seatingCapacity: { type: Number, required: true },
    qrCodeUrl: { type: String }, // টেবিলের কিউআর কোডের লিংক
    status: { 
        type: String, 
        enum: ['Available', 'Occupied', 'Reserved', 'Needs Cleaning'], 
        default: 'Available' 
    }
}, { timestamps: true });

module.exports = mongoose.model('Table', tableSchema);