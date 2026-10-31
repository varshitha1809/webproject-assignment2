const mongoose = require("mongoose");
module.exports = mongoose.model("Issue", new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  location: { type: String, required: true, trim: true },
  category: { type: String, enum: ["Maintenance", "Wi-Fi", "Cleanliness", "Safety", "Other"], default: "Other" },
  description: { type: String, required: true, trim: true },
  reportedBy: { type: String, default: "Campus member" },
  status: { type: String, enum: ["Open", "In Progress", "Resolved"], default: "Open" },
  priority: { type: String, enum: ["Low", "Medium", "High"], default: "Medium" }
}, { timestamps: true }));
