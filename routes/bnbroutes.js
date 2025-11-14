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
    console.log("📸 Uploaded files:", req.files);

    const { 
  owner, 
  name, 
  location, 
  price, 
  description,
  rooms,
  houseType,
  availableFrom,
  availableTo
} = req.body;

    // ✅ Validate input
    if (!owner || !name || !location || !price || !description) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    // ✅ Find owner by email
    const foundOwner = await Owner.findOne({ email: owner });
    if (!foundOwner) {
      return res.status(404).json({ message: "Owner not found!" });
    }

    // ✅ Extract uploaded image URLs
    const imageUrls = Array.isArray(req.files)
      ? req.files.map((file) => file.path)
      : [];

    // ✅ Include owner's WhatsApp number if available
    const hostWhatsapp = foundOwner.whatsapp || null;

    // ✅ Create and save new BNB
    const newBnb = new Bnb({
      owner: foundOwner._id,
      name,
      location,
      price,
      description,
      images: imageUrls,
      hostWhatsapp,
      rooms,
      houseType,
      availableFrom,
      availableTo
    });

    await newBnb.save();
    console.log("✅ New BNB saved:", newBnb._id);

    return res.status(201).json({
      message: "BNB added successfully!",
      bnb: newBnb,
    });
  } catch (err) {
    console.error("❌ Error adding BNB:", err);
    return res.status(500).json({
      message: "Error adding BNB. Please check your Cloudinary or MongoDB connection.",
      error: err.message,
    });
  }
});

// -----------------------------
// 👤 Get BNBs by Owner Email
// -----------------------------
router.get("/owner/:email", async (req, res) => {
  try {
    const email = req.params.email.trim();
    const owner = await Owner.findOne({ email });

    if (!owner) {
      return res.status(404).json({ message: "Owner not found" });
    }

    const bnbs = await Bnb.find({ owner: owner._id }).populate("owner", "name email whatsapp");

    res.json(bnbs);
  } catch (error) {
    console.error("❌ Error fetching owner’s BNBs:", error);
    res.status(500).json({ message: "Error fetching owner’s BNBs" });
  }
});

// -----------------------------
// 📋 Get all BNBs (for public browsing)
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
// ✏️ Update BNB
// -----------------------------
router.put("/:id", upload.array("images", 5), async (req, res) => {
  try {
    const { name, location, price, description,rooms,houseType,availableFrom,availableTo, ownerEmail } = req.body;
    const imageUrls = req.files?.map((file) => file.path) || [];

    const bnb = await Bnb.findById(req.params.id).populate("owner", "email");
    if (!bnb) return res.status(404).json({ message: "BNB not found" });

    if (bnb.owner.email !== ownerEmail) {
      return res.status(403).json({ message: "Unauthorized to edit this property" });
    }

   const updateData = { 
  name,
  location,
  price,
  description,
  rooms: req.body.rooms,
  houseType: req.body.houseType,
  availableFrom: req.body.availableFrom,
  availableTo: req.body.availableTo
};

if (imageUrls.length) updateData.images = imageUrls;

    if (imageUrls.length) updateData.images = imageUrls;

    const updatedBnb = await Bnb.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json({ message: "BNB updated successfully!", updatedBnb });
  } catch (error) {
    console.error("❌ Error updating BNB:", error);
    res.status(500).json({ message: "Error updating BNB" });
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

    if (bnb.owner.email !== ownerEmail) {
      return res.status(403).json({ message: "Unauthorized to delete this property" });
    }

    await bnb.deleteOne();
    res.json({ message: "BNB deleted successfully!" });
  } catch (error) {
    console.error("❌ Error deleting BNB:", error);
    res.status(500).json({ message: "Error deleting BNB" });
  }
});

module.exports = router;
