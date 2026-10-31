const mongoose = require("mongoose");
module.exports = mongoose.model("LostItem", new mongoose.Schema({
  item: { type: String, required: true, trim: true },
  category: { type: String, default: "Other" },
  location: { type: String, required: true, trim: true },
  description: { type: String, default: "" },
  contact: { type: String, required: true, trim: true },
  status: { type: String, enum: ["Unclaimed", "Claimed"], default: "Unclaimed" },
  emoji: { type: String, default: "🔎" }
}, { timestamps: true }));
