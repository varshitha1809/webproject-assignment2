const mongoose = require("mongoose");
module.exports = mongoose.model("Club", new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  category: { type: String, required: true, trim: true },
  members: { type: Number, min: 0, default: 0 },
  meeting: { type: String, required: true, trim: true },
  description: { type: String, default: "" },
  emoji: { type: String, default: "🌱" },
  color: { type: String, default: "mint" }
}, { timestamps: true }));
