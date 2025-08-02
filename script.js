
const SUPABASE_URL = "https://ejvvdrwkucrxpwcfwhco.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqdnZkcndrdWNyeHB3Y2Z3aGNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5NzEyMDIsImV4cCI6MjA2OTU0NzIwMn0.XLflZNyo64aJEAS61mmNvuvpB5RP6iivHchn-dHiYto";

let supabase;

window.onload = () => {
  supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

  // AUTH
  window.signUp = async function () {
    const email = document.getElementById("auth-email").value;
    const password = document.getElementById("auth-password").value;
    const { error } = await supabase.auth.signUp({ email, password });
    document.getElementById("auth-status").textContent = error ? error.message : "Check your email to confirm.";
  };

  window.signIn = async function () {
    const email = document.getElementById("auth-email").value;
    const password = document.getElementById("auth-password").value;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      document.getElementById("auth-status").textContent = error.message;
    } else {
      document.getElementById("auth-section").style.display = "none";
      document.getElementById("user-dashboard").style.display = "block";
      document.getElementById("user-email").textContent = email;
      loadCampaigns();
    }
  };

  window.signOut = function () {
    supabase.auth.signOut();
    document.getElementById("auth-section").style.display = "block";
    document.getElementById("user-dashboard").style.display = "none";
    document.getElementById("user-email").textContent = "User";
  };

  // CAMPAIGNS
  window.saveCampaign = async function () {
    const title = document.getElementById("campaign-title").value;
    const objective = document.getElementById("campaign-objective").value;
    const brief = document.getElementById("campaign-brief").value;

    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("campaigns").insert([{ user_id: user.id, title, objective, brief }]);

    if (error) alert("Error saving campaign: " + error.message);
    else {
      alert("Campaign saved!");
      loadCampaigns();
    }
  };

  async function loadCampaigns() {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase.from("campaigns").select("*").eq("user_id", user.id).order("created_at", { ascending: false });

    const list = document.getElementById("campaign-list");
    list.innerHTML = error ? "<li>Error loading campaigns.</li>" : "";
    if (data) data.forEach((c) => {
      const item = document.createElement("li");
      item.textContent = `${c.title} – ${c.objective}`;
      list.appendChild(item);
    });
  }

  // INFLUENCERS
  async function loadInfluencers() {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/influencers?select=*`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
    });
    const data = await res.json();
    if (Array.isArray(data)) displayInfluencers(data);
    else console.error("Expected array but got:", data);
  }

// Display influencers with checkboxes and status selectors
function displayInfluencers(influencers) {
  const table = document.getElementById("influencer-table");
  if (!table) return;
  table.innerHTML = `
    <tr>
      <th>Select</th>
      <th>Name</th><th>Platform</th><th>Followers</th><th>Engagement</th><th>Niche</th><th>Location</th><th>Status</th>
    </tr>`;
  influencers.forEach((inf) => {
    const row = `
      <tr>
        <td><input type="checkbox" class="influencer-check" data-id="${inf.id}"></td>
        <td>${inf.name}</td>
        <td>${inf.platform}</td>
        <td>${inf.followers}</td>
        <td>${(inf.engagement_rate * 100).toFixed(1)}%</td>
        <td>${inf.niche}</td>
        <td>${inf.location}</td>
        <td>
          <select class="status-select" data-id="${inf.id}">
            <option value="Not Contacted">Not Contacted</option>
            <option value="Emailed">Emailed</option>
            <option value="Negotiating">Negotiating</option>
            <option value="Confirmed">Confirmed</option>
          </select>
        </td>
      </tr>`;
    table.innerHTML += row;
  });
}

// Save selected influencers and statuses to current campaign
window.saveSelectedInfluencers = async function () {
  const checkboxes = document.querySelectorAll(".influencer-check:checked");
  const { data } = await client.auth.getSession();
  const user = data.session?.user;
  if (!user) return alert("You must be logged in.");

  const { data: campaigns } = await client.from("campaigns").select("id").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1);
  const campaign = campaigns?.[0];
  if (!campaign) return alert("No campaign found.");

  const inserts = [];

  checkboxes.forEach(cb => {
    const id = cb.getAttribute("data-id");
    const status = document.querySelector(`.status-select[data-id="${id}"]`).value;
    inserts.push({
      campaign_id: campaign.id,
      influencer_id: id,
      status
    });
  });

  if (inserts.length === 0) return alert("Select at least one influencer.");

  const { error } = await client.from("campaign_influencers").insert(inserts);
  if (error) {
    console.error(error);
    alert("Failed to attach influencers.");
  } else {
    alert("Influencers attached to campaign!");
  }
}

// Show editable outreach progress with dropdowns
async function loadCampaignInfluencers(campaignId) {
  const { data, error } = await client
    .from("campaign_influencers")
    .select("id, status, influencer:influencer_id(name, platform)")
    .eq("campaign_id", campaignId);

  const list = document.getElementById("campaign-influencer-list");
  list.innerHTML = "";
  if (error) return (list.innerHTML = "<li>Error loading outreach data.</li>");

  data.forEach(entry => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${entry.influencer.name}</strong> (${entry.influencer.platform}) –
      <select onchange="updateInfluencerStatus(this)" data-id="${entry.id}">
        <option value="Not Contacted" ${entry.status === "Not Contacted" ? "selected" : ""}>Not Contacted</option>
        <option value="Emailed" ${entry.status === "Emailed" ? "selected" : ""}>Emailed</option>
        <option value="Negotiating" ${entry.status === "Negotiating" ? "selected" : ""}>Negotiating</option>
        <option value="Confirmed" ${entry.status === "Confirmed" ? "selected" : ""}>Confirmed</option>
      </select>
    `;
    list.appendChild(li);
  });
}

// Update status in Supabase when dropdown is changed
async function updateInfluencerStatus(selectEl) {
  const id = selectEl.getAttribute("data-id");
  const newStatus = selectEl.value;

  const { error } = await client
    .from("campaign_influencers")
    .update({ status: newStatus })
    .eq("id", id);

  if (error) {
    alert("Failed to update status.");
    console.error(error);
  } else {
    console.log("Status updated for ID:", id);
  }
}

  // OUTREACH
  window.openOutreachForm = function (influencerId, name) {
    document.getElementById("outreach-modal").style.display = "block";
    document.getElementById("outreach-influencer-id").value = influencerId;
    document.getElementById("outreach-influencer-name").textContent = name;
  };

  window.closeOutreachForm = function () {
    document.getElementById("outreach-modal").style.display = "none";
  };

  window.submitOutreach = async function () {
    const influencerId = document.getElementById("outreach-influencer-id").value;
    const contactMethod = document.getElementById("outreach-method").value;
    const notes = document.getElementById("outreach-notes").value;
    const status = document.getElementById("outreach-status").value;

    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("outreach").insert([{ user_id: user.id, influencer_id: influencerId, contact_method: contactMethod, notes, status }]);

    if (error) alert("Failed to log outreach: " + error.message);
    else {
      alert("Outreach logged!");
      closeOutreachForm();
    }
  };

  loadInfluencers(); // now safely runs after supabase init
};
