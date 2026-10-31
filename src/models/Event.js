const mongoose = require("mongoose");
module.exports = mongoose.model("Event", new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  category: { type: String, enum: ["Workshop", "Culture", "Sports", "Career", "Community"], default: "Community" },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  venue: { type: String, required: true, trim: true },
  host: { type: String, required: true, trim: true },
  attendees: { type: Number, min: 0, default: 0 },
  emoji: { type: String, default: "✨" },
  status: { type: String, enum: ["Upcoming", "Completed", "Cancelled"], default: "Upcoming" }
}, { timestamps: true }));
