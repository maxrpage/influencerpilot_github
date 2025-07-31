<!-- Add this in your <head> if not already -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js"></script>


// Supabase config
const SUPABASE_URL = "https://ejvvdrwkucrxpwcfwhco.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqdnZkcndrdWNyeHB3Y2Z3aGNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5NzEyMDIsImV4cCI6MjA2OTU0NzIwMn0.XLflZNyo64aJEAS61mmNvuvpB5RP6iivHchn-dHiYto";

// Load influencers from Supabase
async function loadInfluencers() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/influencers?select=*`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`
    }
  });
  const influencers = await res.json();
  displayInfluencers(influencers);
}

// Display influencers in the discovery table
function displayInfluencers(influencers) {
  const table = document.getElementById("influencer-table");
  table.innerHTML = `
    <tr>
      <th>Name</th><th>Platform</th><th>Followers</th><th>Engagement</th><th>Niche</th><th>Location</th>
    </tr>`;
  influencers.forEach((inf) => {
    const row = `
      <tr>
        <td>${inf.name}</td>
        <td>${inf.platform}</td>
        <td>${inf.followers}</td>
        <td>${(inf.engagement_rate * 100).toFixed(1)}%</td>
        <td>${inf.niche}</td>
        <td>${inf.location}</td>
      </tr>`;
    table.innerHTML += row;
  });
}



window.addEventListener("DOMContentLoaded", loadInfluencers);

// Supabase config
const SUPABASE_URL = "https://ejvvdrwkucrxpwcfwhco.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqdnZkcndrdWNyeHB3Y2Z3aGNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5NzEyMDIsImV4cCI6MjA2OTU0NzIwMn0.XLflZNyo64aJEAS61mmNvuvpB5RP6iivHchn-dHiYto";
const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Load influencers from Supabase
async function loadInfluencers() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/influencers?select=*`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`
    }
  });
  const influencers = await res.json();
  displayInfluencers(influencers);
}

// Display influencers in the discovery table
function displayInfluencers(influencers) {
  const table = document.getElementById("influencer-table");
  if (!table) return;
  table.innerHTML = `
    <tr>
      <th>Name</th><th>Platform</th><th>Followers</th><th>Engagement</th><th>Niche</th><th>Location</th>
    </tr>`;
  influencers.forEach((inf) => {
    const row = `
      <tr>
        <td>${inf.name}</td>
        <td>${inf.platform}</td>
        <td>${inf.followers}</td>
        <td>${(inf.engagement_rate * 100).toFixed(1)}%</td>
        <td>${inf.niche}</td>
        <td>${inf.location}</td>
      </tr>`;
    table.innerHTML += row;
  });
}

// ---------------------- Auth Section ----------------------

// Sign up
async function signUp() {
  const email = document.getElementById("auth-email").value;
  const password = document.getElementById("auth-password").value;
  const { error } = await client.auth.signUp({ email, password });
  document.getElementById("auth-status").innerText = error ? error.message : "Signup successful. Please log in.";
}

// Sign in
async function signIn() {
  const email = document.getElementById("auth-email").value;
  const password = document.getElementById("auth-password").value;
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) return (document.getElementById("auth-status").innerText = error.message);
  document.getElementById("auth-status").innerText = "";
  loadSession();
}

// Sign out
async function signOut() {
  await client.auth.signOut();
  document.getElementById("auth-section").style.display = "block";
  document.getElementById("user-dashboard").style.display = "none";
}

// Check session on load
async function loadSession() {
  const { data } = await client.auth.getSession();
  const user = data.session?.user;
  if (user) {
    document.getElementById("auth-section").style.display = "none";
    document.getElementById("user-dashboard").style.display = "block";
    document.getElementById("user-email").innerText = user.email;
    fetchCampaigns(user.id);
  }
}

// Save a campaign
async function saveCampaign() {
  const { data } = await client.auth.getSession();
  const user = data.session?.user;
  if (!user) return alert("Not logged in.");

  const title = document.getElementById("campaign-title").value;
  const objective = document.getElementById("campaign-objective").value;
  const brief = document.getElementById("campaign-brief").value;

  const { error } = await client.from("campaigns").insert([{ user_id: user.id, title, objective, brief }]);
  if (error) return alert("Error saving: " + error.message);
  fetchCampaigns(user.id);
}

// Load campaigns for the user
async function fetchCampaigns(userId) {
  const { data, error } = await client.from("campaigns").select("*").eq("user_id", userId).order("created_at", { ascending: false });
  const list = document.getElementById("campaign-list");
  list.innerHTML = "";
  if (error) return (list.innerHTML = `<li>Error loading campaigns.</li>`);
  data.forEach(c => {
    list.innerHTML += `<li><strong>${c.title}</strong><br>${c.objective}<br><em>${c.brief}</em></li>`;
  });
}

// On page load
window.addEventListener("DOMContentLoaded", () => {
  loadSession();
  loadInfluencers();
});

