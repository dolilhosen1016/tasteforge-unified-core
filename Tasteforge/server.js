const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // JSON ডেটা পার্স করার জন্য

// Database Connection
mongoose.connect('mongodb://127.0.0.1:27017/tasteforge_db')
    .then(() => console.log('✅ MongoDB Connected Successfully!'))
    .catch((err) => console.log('❌ MongoDB Connection Error:', err));

// ==========================================
// Import Routes (এই অংশটাই মিসিং ছিল সম্ভবত)
const userRoutes = require('./routes/user');
app.use('/api/users', userRoutes);
// ==========================================

// Basic Route for Testing
app.get('/', (req, res) => {
    res.send('Welcome to TasteForge Unified API');
});

// Server Listen
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});