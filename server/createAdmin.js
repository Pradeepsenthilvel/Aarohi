require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/aarohi';

async function createAdmin() {
  try {
    await mongoose.connect(MONGO_URI);
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@aarohi.com' });
    if (existingAdmin) {
      console.log('Admin user already exists. Email: admin@aarohi.com, Password: adminpassword');
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('adminpassword', salt);

    const admin = new User({
      username: 'Administrator',
      email: 'admin@aarohi.com',
      password: hashedPassword,
      role: 'admin',
      isPremium: true
    });

    await admin.save();
    console.log('Admin user created successfully!');
    console.log('Email: admin@aarohi.com');
    console.log('Password: adminpassword');
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
}

createAdmin();
