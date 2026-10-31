const Event = require("./models/Event");
const LostItem = require("./models/LostItem");
const Issue = require("./models/Issue");
const Club = require("./models/Club");

async function seed() {
  const future = days => { const d = new Date(); d.setDate(d.getDate() + days); d.setHours(0,0,0,0); return d; };
  if (!await Event.countDocuments()) await Event.insertMany([
    { title: "Design Your Future", category: "Workshop", date: future(1), time: "10:30 AM", venue: "Innovation Lab", host: "Creative Society", attendees: 84, emoji: "🎨" },
    { title: "Moonlight Open Mic", category: "Culture", date: future(2), time: "6:00 PM", venue: "Central Courtyard", host: "Arts Collective", attendees: 126, emoji: "🎤" },
    { title: "Campus Green Sprint", category: "Community", date: future(4), time: "8:00 AM", venue: "East Garden", host: "Eco Circle", attendees: 53, emoji: "🌿" },
    { title: "Career Launchpad", category: "Career", date: future(6), time: "2:00 PM", venue: "Auditorium B", host: "Career Office", attendees: 210, emoji: "🚀" }
  ]);
  if (!await LostItem.countDocuments()) await LostItem.insertMany([
    { item: "Blue water bottle", category: "Bottle", location: "Library, 2nd floor", description: "Matte blue bottle with stickers.", contact: "library@campus.example", emoji: "🧴" },
    { item: "Wireless earbuds case", category: "Electronics", location: "Cafeteria", description: "White charging case found near window seats.", contact: "helpdesk@campus.example", emoji: "🎧" },
    { item: "Sketchbook", category: "Stationery", location: "Art studio", description: "Black cover, pencil sketches inside.", contact: "artsclub@campus.example", emoji: "📓" }
  ]);
  if (!await Issue.countDocuments()) await Issue.insertMany([
    { title: "Wi-Fi weak in study zone", location: "Library, 3rd floor", category: "Wi-Fi", description: "Connection drops around the group study tables.", reportedBy: "A student", status: "In Progress", priority: "Medium" },
    { title: "Water fountain needs attention", location: "Science block", category: "Maintenance", description: "Fountain is not dispensing cold water.", reportedBy: "Campus member", priority: "Low" },
    { title: "Path light not working", location: "North walkway", category: "Safety", description: "The light near the bicycle rack is off after sunset.", reportedBy: "A student", priority: "High" }
  ]);
  if (!await Club.countDocuments()) await Club.insertMany([
    { name: "Creative Society", category: "Arts & Design", members: 128, meeting: "Tue · 4:00 PM", description: "Make things, share ideas, and learn creative tools together.", emoji: "🎨", color: "peach" },
    { name: "Eco Circle", category: "Environment", members: 96, meeting: "Thu · 3:30 PM", description: "Small campus actions for a greener community.", emoji: "🌿", color: "mint" },
    { name: "Code Collective", category: "Technology", members: 214, meeting: "Fri · 5:00 PM", description: "Build projects, practice coding, and host mini hackathons.", emoji: "💻", color: "lavender" },
    { name: "Open Mic Crew", category: "Culture", members: 74, meeting: "Wed · 4:30 PM", description: "A welcoming stage for music, poetry, and storytelling.", emoji: "🎤", color: "sky" }
  ]);
}
module.exports = { seed };
