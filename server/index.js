require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');


const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Serve uploaded audio files statically with correct Content-Type
app.use('/uploads', (req, res, next) => {
  if (req.path.endsWith('.mp3')) res.setHeader('Content-Type', 'audio/mpeg');
  else if (req.path.endsWith('.wav')) res.setHeader('Content-Type', 'audio/wav');
  next();
}, express.static(path.join(__dirname, 'uploads')));

// Test Route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Aarohi API is running.' });
});

// Import Routes
const authRoutes = require('./src/routes/authRoutes');
const musicRoutes = require('./src/routes/musicRoutes');
const paymentRoutes = require('./src/routes/paymentRoutes');
const adminRoutes = require('./src/routes/adminRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/music', musicRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/admin', adminRoutes);

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;

// Database Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/aarohi';
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    console.log('Starting server without DB...');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} (No DB)`);
    });
  });
