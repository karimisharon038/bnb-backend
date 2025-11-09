const express = require("express");
const router = express.Router();
const Message = require("../models/messageModel");

// Save a message
router.post("/", async (req, res) => {
  try {
    const { name, phone, message, receiver } = req.body;
    const newMessage = new Message({ name, phone, message, receiver });
    await newMessage.save();
    res.status(201).json({ success: true, msg: "Message sent!" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get all messages (admin use)
router.get("/", async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
