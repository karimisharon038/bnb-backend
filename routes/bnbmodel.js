const mongoose = require("mongoose");

const bnbSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Owners", // ✅ Must match owners.js
      required: true,
    },
    name: { type: String, required: true },
    location: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    images: { type: [String], default: [] },
rooms: { type: Number, required: true },
houseType: { type: String, required: true },
availableFrom: { type: Date, required: true },
availableTo: { type: Date, required: true },

    // ✅ NEW: store host WhatsApp number (linked to owner)
    hostWhatsapp: {
      type: String,
      required: false,
      default: null, // filled automatically from owner account
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BnB", bnbSchema);
