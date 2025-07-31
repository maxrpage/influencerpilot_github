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
