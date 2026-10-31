require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const Event = require("./src/models/Event");
const LostItem = require("./src/models/LostItem");
const Issue = require("./src/models/Issue");
const Club = require("./src/models/Club");
const { seed } = require("./src/seed");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/health", (req, res) => res.json({
  status: "ok",
  database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  app: "CampusPulse"
}));

app.get("/api/dashboard", async (req, res, next) => {
  try {
    const [events, lostItems, openIssues, clubs, upcomingEvents, latestItems, issues] = await Promise.all([
      Event.countDocuments({ status: "Upcoming" }),
      LostItem.countDocuments({ status: "Unclaimed" }),
      Issue.countDocuments({ status: { $in: ["Open", "In Progress"] } }),
      Club.countDocuments(),
      Event.find({ status: "Upcoming" }).sort({ date: 1 }).limit(3),
      LostItem.find().sort({ createdAt: -1 }).limit(4),
      Issue.find().sort({ createdAt: -1 }).limit(4)
    ]);
    res.json({ stats: { events, lostItems, openIssues, clubs }, upcomingEvents, latestItems, issues });
  } catch (e) { next(e); }
});

app.get("/api/events", async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.status) filter.status = req.query.status;
    res.json(await Event.find(filter).sort({ date: 1 }));
  } catch (e) { next(e); }
});
app.post("/api/events", async (req, res, next) => {
  try { res.status(201).json(await Event.create(req.body)); }
  catch (e) { next(e); }
});

app.get("/api/lost-found", async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.search) filter.$or = [
      { item: { $regex: req.query.search, $options: "i" } },
      { location: { $regex: req.query.search, $options: "i" } }
    ];
    res.json(await LostItem.find(filter).sort({ createdAt: -1 }));
  } catch (e) { next(e); }
});
app.post("/api/lost-found", async (req, res, next) => {
  try { res.status(201).json(await LostItem.create(req.body)); }
  catch (e) { next(e); }
});
app.patch("/api/lost-found/:id/claim", async (req, res, next) => {
  try {
    const item = await LostItem.findByIdAndUpdate(req.params.id, { status: "Claimed" }, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ error: "Item not found" });
    res.json(item);
  } catch (e) { next(e); }
});

app.get("/api/issues", async (req, res, next) => {
  try { res.json(await Issue.find().sort({ createdAt: -1 })); }
  catch (e) { next(e); }
});
app.post("/api/issues", async (req, res, next) => {
  try { res.status(201).json(await Issue.create(req.body)); }
  catch (e) { next(e); }
});
app.patch("/api/issues/:id", async (req, res, next) => {
  try {
    const issue = await Issue.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true, runValidators: true });
    if (!issue) return res.status(404).json({ error: "Issue not found" });
    res.json(issue);
  } catch (e) { next(e); }
});

app.get("/api/clubs", async (req, res, next) => {
  try { res.json(await Club.find().sort({ name: 1 })); }
  catch (e) { next(e); }
});
app.post("/api/clubs", async (req, res, next) => {
  try { res.status(201).json(await Club.create(req.body)); }
  catch (e) { next(e); }
});

app.use("/api", (req, res) => res.status(404).json({ error: "API endpoint not found" }));
app.use((err, req, res, next) => {
  console.error(err);
  if (err.name === "ValidationError" || err.code === 11000 || err.name === "CastError") {
    return res.status(400).json({ error: err.code === 11000 ? "This record already exists." : err.message });
  }
  res.status(500).json({ error: "Something went wrong on the server." });
});

async function start() {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/campuspulse");
    if (process.env.SEED_DATABASE !== "false") await seed();
    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`CampusPulse running at http://localhost:${port}`));
  } catch (e) {
    console.error("Startup failed:", e.message);
    process.exit(1);
  }
}
if (require.main === module) start();
module.exports = app;
