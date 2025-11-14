const express = require("express");
const router = express.Router();
const Bnb = require("../models/bnbmodel");
const Owner = require("../models/owners");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();

// -----------------------------
// 🌥️ Configure Cloudinary
// -----------------------------
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// -----------------------------
// 💾 Multer + Cloudinary Storage
// -----------------------------
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "bnb-images",
    allowed_formats: ["jpg", "jpeg", "png"],
  },
});
const upload = multer({ storage });

// -----------------------------
// 🏡 Add a new BNB
// -----------------------------
router.post("/add", upload.array("images", 5), async (req, res) => {
  try {
    console.log("📦 Received form data:", req.body);

    const { ownerEmail, name, location, price, description, rooms, houseType } = req.body;

    if (!ownerEmail || !name || !location || !price || !description || !rooms || !houseType) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    const foundOwner = await Owner.findOne({ email: ownerEmail });
    if (!foundOwner) {
      return res.status(404).json({ message: "Owner not found!" });
    }

    const imageUrls = Array.isArray(req.files) ? req.files.map(file => file.path) : [];
    const hostWhatsapp = foundOwner.whatsapp || null;

    const newBnb = new Bnb({
      owner: foundOwner._id,
      name,
      location,
      price,
      description,
      rooms,
      houseType,
      isAvailable: true, // default to available
      images: imageUrls,
      hostWhatsapp,
    });

    await newBnb.save();

    return res.status(201).json({
      message: "BNB added successfully!",
      bnb: newBnb,
    });
  } catch (err) {
    console.error("❌ Error adding BNB:", err);
    return res.status(500).json({ message: "Error adding BNB.", error: err.message });
  }
});

// -----------------------------
// 👤 Get BNBs by Owner Email
// -----------------------------
router.get("/owner/:email", async (req, res) => {
  try {
    const email = req.params.email.trim();
    const owner = await Owner.findOne({ email });
    if (!owner) return res.status(404).json({ message: "Owner not found" });

    const bnbs = await Bnb.find({ owner: owner._id }).populate("owner", "name email whatsapp");
    res.json(bnbs);
  } catch (error) {
    console.error("❌ Error fetching owner's BNBs:", error);
    res.status(500).json({ message: "Error fetching owner’s BNBs" });
  }
});

// -----------------------------
// 📋 Get all BNBs (public)
// -----------------------------
router.get("/", async (req, res) => {
  try {
    const bnbs = await Bnb.find().populate("owner", "name email whatsapp");
    res.json(bnbs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching BNBs" });
  }
});

// -----------------------------
// ✏️ Update BNB (excluding availability)
// -----------------------------
router.put("/:id", upload.array("images", 5), async (req, res) => {
  try {
    const { name, location, price, description, rooms, houseType, ownerEmail } = req.body;
    const imageUrls = req.files?.map(file => file.path) || [];

    const bnb = await Bnb.findById(req.params.id).populate("owner", "email");
    if (!bnb) return res.status(404).json({ message: "BNB not found" });
    if (bnb.owner.email !== ownerEmail) return res.status(403).json({ message: "Unauthorized to edit this property" });

    const updateData = { name, location, price, description, rooms, houseType };
    if (imageUrls.length) updateData.images = imageUrls;

    const updatedBnb = await Bnb.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json({ message: "BNB updated successfully!", updatedBnb });
  } catch (error) {
    console.error("❌ Error updating BNB:", error);
    res.status(500).json({ message: "Error updating BNB" });
  }
});

// -----------------------------
// 🔄 Toggle Availability
// -----------------------------
router.put("/:id/availability", async (req, res) => {
  try {
    const { ownerEmail, availability } = req.body;
    const bnb = await Bnb.findById(req.params.id).populate("owner", "email");
    if (!bnb) return res.status(404).json({ message: "BNB not found" });
    if (bnb.owner.email !== ownerEmail) return res.status(403).json({ message: "Unauthorized" });

    bnb.isAvailable = availability === "available";
    await bnb.save();

    res.json({ message: "Availability updated successfully!", bnb });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating availability" });
  }
});

// -----------------------------
// 🔍 Get single BNB by ID
// -----------------------------
router.get("/:id", async (req, res) => {
  try {
    const bnb = await Bnb.findById(req.params.id).populate("owner", "name email whatsapp");
    if (!bnb) return res.status(404).json({ message: "BNB not found" });
    res.json(bnb);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching BNB" });
  }
});

// -----------------------------
// 🗑️ Delete BNB
// -----------------------------
router.delete("/:id", async (req, res) => {
  try {
    const { ownerEmail } = req.body;
    const bnb = await Bnb.findById(req.params.id).populate("owner", "email");
    if (!bnb) return res.status(404).json({ message: "BNB not found" });
    if (bnb.owner.email !== ownerEmail) return res.status(403).json({ message: "Unauthorized to delete this property" });

    await bnb.deleteOne();
    res.json({ message: "BNB deleted successfully!" });
  } catch (error) {
    console.error("❌ Error deleting BNB:", error);
    res.status(500).json({ message: "Error deleting BNB" });
  }
});

module.exports = router;
