const mongoose = require("mongoose");

const ownersSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// ✅ Prevent OverwriteModelError
module.exports = mongoose.models.Owners || mongoose.model("Owners", ownersSchema);
