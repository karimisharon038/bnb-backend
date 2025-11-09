const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Or "Owner" depending on who sends it
    required: false,
  },
  receiver: {
    type: String, // "admin" or owner email/id
    required: true,
  },
  name: String,
  phone: String,
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Message", messageSchema);
