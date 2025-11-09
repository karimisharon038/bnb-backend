// ===== IMPORT DEPENDENCIES =====
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const chatRoutes = require("./routes/chatRoutes");
app.use("/api/chat", chatRoutes);

// ===== INITIALIZE APP =====
const app = express();

// ===== MIDDLEWARE =====
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===== MONGODB CONNECTION =====
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ===== ROUTES =====
const ownerRoutes = require("./routes/ownerRoutes");
const bnbRoutes = require("./routes/bnbroutes");

app.use("/api/owners", ownerRoutes);
app.use("/api/bnbs", bnbRoutes);

// ✅ Backend ONLY—no frontend files served here
app.get("/", (req, res) => {
  res.json({ message: "Backend is running ✅" });
});

// ===== START SERVER =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
