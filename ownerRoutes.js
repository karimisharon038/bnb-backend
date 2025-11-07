const express = require('express');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const router = express.Router();

// Define Owner Schema
const ownerSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
});

// Create Owner Model
const Owner = mongoose.model("Owner", ownerSchema);

// ✅ REGISTER route
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingOwner = await Owner.findOne({ email });
    if (existingOwner) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save new owner
    const newOwner = new Owner({ name, email, password: hashedPassword });
    await newOwner.save();

    res.json({ message: "Owner registered successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error registering owner" });
  }
});

// ✅ LOGIN route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const owner = await Owner.findOne({ email });

    if (!owner) {
      return res.status(400).json({ message: "Owner not found" });
    }

    const isMatch = await bcrypt.compare(password, owner.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    res.json({
      message: "Login successful!",
      owner: {
        id: owner._id,
        name: owner.name,
        email: owner.email,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error logging in" });
  }
});

module.exports = router;
