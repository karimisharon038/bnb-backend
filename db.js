// config/db.js
const mongoose = require("mongoose");

// Replace this with your own MongoDB connection string
const MONGO_URI = "mongodb+srv://karimisharon038_db_user:pAuSp0zrTiymHMFU@clusterbnb.zuddvud.mongodb.net/?appName=ClusterBnB";

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected successfully");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
