const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function toast(message) {
  const el = $("#toast"); el.textContent = message; el.hidden = false;
  clearTimeout(window.toastTimer); window.toastTimer = setTimeout(() => el.hidden = true, 3800);
}
async function api(url, options = {}) {
  const r = await fetch(url, {headers: {"Content-Type":"application/json"}, ...options});
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || "Request failed");
  return data;
}
function prettyDate(value) {
  const d = new Date(value);
  return {day:d.toLocaleDateString(undefined,{day:"2-digit"}), month:d.toLocaleDateString(undefined,{month:"short"}).toUpperCase()};
}
function setView(view, label) {
  $("#crumbTitle").textContent = label || view[0].toUpperCase()+view.slice(1);
  $$(".nav").forEach(b => b.classList.toggle("active", b.dataset.view === view));
}
async function loadDashboard() {
  try {
    const d = await api("/api/dashboard");
    $("#eventCount").textContent = d.stats.events;
    $("#lostCount").textContent = d.stats.lostItems;
    $("#issueCount").textContent = d.stats.openIssues;
    $("#clubCount").textContent = d.stats.clubs;
    $("#lostNav").textContent = d.stats.lostItems;
    $("#issueNav").textContent = d.stats.openIssues;
    renderEvents(d.upcomingEvents.slice(0,3));
    renderLost(d.latestItems.filter(i=>i.status==="Unclaimed").slice(0,3));
    renderIssues(d.issues.slice(0,3));
    renderClubs(await api("/api/clubs"));
  } catch(e) { toast("Could not connect to the API. Start the app with Docker Compose."); }
}
function renderEvents(items) {
  $("#eventList").innerHTML = items.length ? items.map(e => {
    const d=prettyDate(e.date);
    return `<div class="event-row"><div class="event-date"><b>${d.day}</b><small>${d.month}</small></div><div class="event-info"><b>${esc(e.emoji)} ${esc(e.title)}</b><small>${esc(e.time)} · ${esc(e.venue)} · ${esc(e.host)}</small></div><span class="category">${esc(e.category)}</span></div>`;
  }).join("") : '<div class="loading">No upcoming events yet. Add the first one!</div>';
}
function renderLost(items) {
  $("#lostList").innerHTML = items.length ? items.map(i => `<div class="lost-row"><div class="lost-emoji">${esc(i.emoji||"🔎")}</div><div class="lost-info"><b>${esc(i.item)}</b><small>⌖ ${esc(i.location)}</small></div><button data-contact="${esc(i.contact)}">Contact</button></div>`).join("") : '<div class="loading">Nothing waiting to be found right now.</div>';
  $$("[data-contact]").forEach(b => b.addEventListener("click",()=>toast("Contact: "+b.dataset.contact)));
}
function renderIssues(items) {
  $("#issueList").innerHTML = items.length ? items.map(i => `<div class="issue-row"><div class="issue-mark">${i.category==="Wi-Fi"?"⌁":i.category==="Safety"?"♧":"⚒"}</div><div class="issue-info"><b>${esc(i.title)}</b><small>${esc(i.location)} · ${esc(i.category)}</small></div><span class="status ${i.status.toLowerCase().replace(" ","-")}">${esc(i.status)}</span></div>`).join("") : '<div class="loading">No reports yet.</div>';
}
function renderClubs(clubs) {
  $("#clubList").innerHTML = clubs.slice(0,4).map(c=>`<div class="club-card"><div class="club-emoji ${esc(c.color)}">${esc(c.emoji)}</div><div><b>${esc(c.name)}</b><small>${esc(c.category)}<br>♙ ${c.members} members · ${esc(c.meeting)}</small></div></div>`).join("");
}
async function showEvents() {
  const items = await api("/api/events");
  renderEvents(items);
  $("#eventList").innerHTML += '<button class="wide-btn" data-action="event">＋ Host a new campus event</button>';
  $("#eventList").querySelector("[data-action]").addEventListener("click",()=>$("#eventDialog").showModal());
  $("#eventList").scrollIntoView({behavior:"smooth",block:"center"});
}
async function showLost() {
  const items = await api("/api/lost-found");
  $("#lostList").innerHTML = items.map(i=>`<div class="lost-row"><div class="lost-emoji">${esc(i.emoji||"🔎")}</div><div class="lost-info"><b>${esc(i.item)} <span class="status ${i.status==="Claimed"?"resolved":"open"}">${esc(i.status)}</span></b><small>⌖ ${esc(i.location)} · ${esc(i.description)}</small></div>${i.status==="Unclaimed"?`<button data-claim="${i._id}">Mark found</button>`:""}</div>`).join("");
  $$("[data-claim]").forEach(b=>b.addEventListener("click",async()=>{try{await api(`/api/lost-found/${b.dataset.claim}/claim`,{method:"PATCH"});toast("Item marked as claimed.");await showLost();await loadDashboard();}catch(e){toast(e.message)}}));
  $("#lostList").scrollIntoView({behavior:"smooth",block:"center"});
}
async function showIssues() {
  const items = await api("/api/issues");
  renderIssues(items);
  $("#issueList").innerHTML = items.map(i=>`<div class="issue-row"><div class="issue-mark">⚒</div><div class="issue-info"><b>${esc(i.title)}</b><small>${esc(i.location)} · ${esc(i.category)} · Priority: ${esc(i.priority)}</small></div><select data-status="${i._id}" aria-label="Update status"><option ${i.status==="Open"?"selected":""}>Open</option><option ${i.status==="In Progress"?"selected":""}>In Progress</option><option ${i.status==="Resolved"?"selected":""}>Resolved</option></select></div>`).join("");
  $$("[data-status]").forEach(s=>s.addEventListener("change",async()=>{try{await api(`/api/issues/${s.dataset.status}`,{method:"PATCH",body:JSON.stringify({status:s.value})});toast("Issue status updated.");await loadDashboard();await showIssues();}catch(e){toast(e.message)}}));
  $("#issueList").scrollIntoView({behavior:"smooth",block:"center"});
}
async function showClubs() {
  const clubs=await api("/api/clubs");
  $("#clubList").innerHTML=clubs.map(c=>`<div class="club-card"><div class="club-emoji ${esc(c.color)}">${esc(c.emoji)}</div><div><b>${esc(c.name)}</b><small>${esc(c.category)}<br>${esc(c.description)}<br>♙ ${c.members} members · ${esc(c.meeting)}</small></div></div>`).join("");
  $("#clubList").scrollIntoView({behavior:"smooth",block:"center"});
}
$$(".nav").forEach(b=>b.addEventListener("click",async()=>{setView(b.dataset.view,b.textContent.trim());try{if(b.dataset.view==="events")await showEvents();if(b.dataset.view==="lost")await showLost();if(b.dataset.view==="issues")await showIssues();if(b.dataset.view==="clubs")await showClubs();if(b.dataset.view==="home")window.scrollTo({top:0,behavior:"smooth"});}catch(e){toast(e.message)}}));
$$("[data-view]").filter(b=>!b.classList.contains("nav")).forEach(b=>b.addEventListener("click",async()=>{const view=b.dataset.view;setView(view);try{if(view==="events")await showEvents();}catch(e){toast(e.message)}}));
$$("[data-action]").forEach(b=>b.addEventListener("click",()=>{const a=b.dataset.action;if(a==="event")$("#eventDialog").showModal();if(a==="lost")$("#lostDialog").showModal();if(a==="issue")$("#issueDialog").showModal()}));
$$("[data-close]").forEach(b=>b.addEventListener("click",()=>b.closest("dialog").close()));
function wireForm(formId, endpoint, after, transform=x=>x) {
  $(formId).addEventListener("submit",async ev=>{
    ev.preventDefault();
    const payload=transform(Object.fromEntries(new FormData(ev.currentTarget).entries()));
    try{await api(endpoint,{method:"POST",body:JSON.stringify(payload)});ev.currentTarget.closest("dialog").close();ev.currentTarget.reset();toast("Nice! Your contribution is live.");await loadDashboard();if(after)await after();}
    catch(e){toast(e.message);}
  });
}
wireForm("#eventForm","/api/events",showEvents,p=>({...p,date:new Date(p.date+"T12:00:00"),attendees:0,emoji:"✨"}));
wireForm("#lostForm","/api/lost-found",showLost,p=>({...p,emoji:"🔎"}));
wireForm("#issueForm","/api/issues",showIssues,p=>({...p,reportedBy:p.reportedBy||"Campus member"}));
$("#themeToggle").addEventListener("click",()=>document.body.classList.toggle("dark"));
$("#bell").addEventListener("click",()=>toast("You're all caught up. Check the campus feed for fresh updates!"));
$("#eventForm [name=date]").min=new Date().toISOString().slice(0,10);
loadDashboard();
