const mongoose = require('mongoose');
const dns = require('dns');
require('dotenv').config();

dns.setDefaultResultOrder('ipv4first');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('MongoDB დაკავშირებულია');
  } catch (err) {
    console.error('MongoDB შეცდომა:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
