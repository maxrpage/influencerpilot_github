
// Supabase config
const SUPABASE_URL = "https://ejvvdrwkucrxpwcfwhco.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqdnZkcndrdWNyeHB3Y2Z3aGNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5NzEyMDIsImV4cCI6MjA2OTU0NzIwMn0.XLflZNyo64aJEAS61mmNvuvpB5RP6iivHchn-dHiYto";
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Load influencers from Supabase
async function loadInfluencers() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/influencers?select=*`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`
    }
  });
  const data = await res.json();
  if (Array.isArray(data)) {
    displayInfluencers(data);
  } else {
    console.error("Expected array but got:", data);
  }
}

// Display influencers in the table
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
      <td><button class="btn" onclick="openOutreachForm('${inf.id}', '${inf.name}')">Log Outreach</button></td>
    </tr>`;
  table.innerHTML += row;
});

}

// Sign out
function signOut() {
  if (document.getElementById("auth-section"))
    document.getElementById("auth-section").style.display = "block";
  if (document.getElementById("user-dashboard"))
    document.getElementById("user-dashboard").style.display = "none";
  document.getElementById("user-email").textContent = "User";
}

// Initialize
window.addEventListener("DOMContentLoaded", loadInfluencers);
