const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const Owner = require("../models/owners"); // ✅ Use your existing owners.js model

// ✅ REGISTER
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, whatsapp, phone } = req.body;

    const existingOwner = await Owner.findOne({ email });
    if (existingOwner) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newOwner = new Owner({ name, email, password: hashedPassword, whatsapp, phone });
    await newOwner.save();

    res.json({ message: "Owner registered successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error registering owner" });
  }
});

// ✅ LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const owner = await Owner.findOne({ email });

    if (!owner) return res.status(400).json({ message: "Owner not found" });

    const isMatch = await bcrypt.compare(password, owner.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    res.json({
      message: "Login successful!",
      owner: {
        id: owner._id,
        name: owner.name,
        email: owner.email,
        whatsapp: owner.whatsapp,
        phone: owner.phone,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error logging in" });
  }
});

// ✅ Get host contact info by owner ID
router.get("/host/:id", async (req, res) => {
  try {
    const owner = await Owner.findById(req.params.id).select("name phone whatsapp");
    if (!owner) return res.status(404).json({ message: "Host not found" });

    res.json({ name: owner.name, phone: owner.phone, whatsapp: owner.whatsapp });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
