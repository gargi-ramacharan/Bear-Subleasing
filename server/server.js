const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const Listing = require('./models/listings');
const User = require('./models/users');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let isConnected = false;

const connectDB = async () => {
  mongoose.set('strictQuery', true);
  if (isConnected) return;

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log('✅ Connected to MongoDB!');
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err);
    throw err;
  }
};

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Bear Leasing server is running' });
});

app.get('/api/listings', async (req, res) => {
  try {
    await connectDB();
    const listings = await Listing.find().sort({ createdAt: -1 });
    res.json(listings);
  } catch (error) {
    res.status(500).json({ message: 'Could not fetch listings', error: error.message });
  }
});

app.post('/api/listings', async (req, res) => {
  try {
    await connectDB();
    const listing = await Listing.create(req.body);
    res.status(201).json(listing);
  } catch (error) {
    res.status(400).json({ message: 'Could not create listing', error: error.message });
  }
});

app.patch('/api/listings/:id', async (req, res) => {
  try {
    await connectDB();
    const listing = await Listing.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    res.json(listing);
  } catch (error) {
    res.status(400).json({ message: 'Could not update listing', error: error.message });
  }
});

app.delete('/api/listings/:id', async (req, res) => {
  try {
    await connectDB();
    const listing = await Listing.findByIdAndDelete(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    res.json({ message: 'Listing deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Could not delete listing', error: error.message });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    await connectDB();
    const users = await User.find().populate('listings').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Could not fetch users', error: error.message });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    await connectDB();
    const user = await User.create(req.body);
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ message: 'Could not create user