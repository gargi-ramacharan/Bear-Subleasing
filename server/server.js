const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const Listing = require('./models/listings');
const User = require('./models/users');

const app = express();

// MIDDLEWARE
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// THE VERCEL FIX: Connection Singleton
// This prevents the "Too Many Connections" error seen in your logs
let cachedDb = null;

const connectDB = async () => {
  if (cachedDb && mongoose.connection.readyState === 1) {
    return cachedDb;
  }
  console.log('--- Establishing New MongoDB Connection ---');
  const db = await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
  });
  cachedDb = db;
  return db;
};

// API ROUTES
app.get('/api/listings', async (req, res) => {
  try {
    await connectDB();
    const listings = await Listing.find().sort({ createdAt: -1 });
    res.json(listings);
  } catch (error) {
    console.error("Listings Error:", error);
    res.status(500).json({ message: 'Error fetching listings' });
  }
});

app.post('/api/listings', async (req, res) => {
  try {
    await connectDB();
    const listing = await Listing.create(req.body);
    res.status(201).json(listing);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// USERS
app.get('/api/users', async (req, res) => {
  try {
    await connectDB();
    const users = await User.find().populate('listings');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// FRONTEND CATCH-ALL
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// EXPORT FOR VERCEL (Crucial)
module.exports = app;

// LOCAL ONLY
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => console.log(`Server at http://localhost:${PORT}`));
}