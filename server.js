// ===== IMPORT DEPENDENCIES =====
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const chatRoutes = require("./routes/chatRoutes");
const ownerRoutes = require("./routes/ownerRoutes");
const bnbRoutes = require("./routes/bnbroutes");

// ===== INITIALIZE APP =====
const app = express();

// ===== MIDDLEWARE =====
app.use(
  cors({
    origin: "*", // ✅ Allow all origins (frontend access)
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===== MONGODB CONNECTION =====
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
  });

// ===== ROUTES =====
app.use("/api/chat", chatRoutes);
app.use("/api/owners", ownerRoutes);
app.use("/api/bnbs", bnbRoutes);

// ✅ Default route (check backend status)
app.get("/", (req, res) => {
  res.json({ message: "Backend is running ✅" });
});

// ===== GLOBAL ERROR HANDLER (prevents Network Error) =====
app.use((err, req, res, next) => {
  console.error("❌ Unhandled Server Error:", err);
  if (!res.headersSent) {
    res.status(500).json({
      message: "Internal server error occurred.",
      error: err.message,
    });
  }
});

// ===== 404 HANDLER =====
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ===== START SERVER =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
