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

    const { owner, name, location, price, description } = req.body;

    if (!owner || !name || !location || !price || !description) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    // ✅ Find owner by email
    const foundOwner = await Owner.findOne({ email: owner });
    if (!foundOwner) {
      return res.status(404).json({ message: "Owner not found!" });
    }

    const imageUrls = req.files?.map(file => file.path) || [];

    const newBnb = new Bnb({
      owner: foundOwner._id,
      name,
      location,
      price,
      description,
      images: imageUrls,
    });

    await newBnb.save();
    console.log("✅ New BNB saved:", newBnb);
    res.status(201).json({ message: "BNB added successfully!", bnb: newBnb });
  } catch (err) {
    console.error("❌ Error adding BNB:", err);
    res.status(500).json({ message: "Error adding BNB" });
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

    // ✅ Only fetch BNBs belonging to this owner
    const bnbs = await Bnb.find({ owner: owner._id })
      .populate("owner", "name email");

    console.log(`📋 Returning ${bnbs.length} BNBs for ${email}`);
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
    const bnbs = await Bnb.find().populate("owner", "name email");
    res.json(bnbs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching BNBs" });
  }
});

// -----------------------------
// ✏️ Update BNB (only by its owner)
// -----------------------------
router.put("/:id", upload.array("images", 5), async (req, res) => {
  try {
    const { name, location, price, description, ownerEmail } = req.body;
    const imageUrls = req.files?.map(file => file.path) || [];

    const bnb = await Bnb.findById(req.params.id).populate("owner", "email");
    if (!bnb) return res.status(404).json({ message: "BNB not found" });

    // ✅ Prevent other owners from editing
    if (bnb.owner.email !== ownerEmail) {
      return res.status(403).json({ message: "Unauthorized to edit this property" });
    }

    const updateData = { name, location, price, description };
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
    const bnb = await Bnb.findById(req.params.id).populate("owner", "name email");
    if (!bnb) return res.status(404).json({ message: "BNB not found" });
    res.json(bnb);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching BNB" });
  }
});

// -----------------------------
// 🗑️ Delete BNB (only by its owner)
// -----------------------------
router.delete("/:id", async (req, res) => {
  try {
    const { ownerEmail } = req.body;

    const bnb = await Bnb.findById(req.params.id).populate("owner", "email");
    if (!bnb) return res.status(404).json({ message: "BNB not found" });

    // ✅ Prevent deletion by other users
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
