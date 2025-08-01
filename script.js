
const SUPABASE_URL = "https://ejvvdrwkucrxpwcfwhco.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...REAL_KEY_HERE";

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

  function displayInfluencers(influencers) {
    const table = document.getElementById("influencer-table");
    if (!table) return;
    table.innerHTML = `
      <tr>
        <th>Name</th><th>Platform</th><th>Followers</th><th>Engagement</th><th>Niche</th><th>Location</th><th>Outreach</th>
      </tr>`;
    influencers.forEach((inf) => {
      table.innerHTML += `
        <tr>
          <td>${inf.name}</td>
          <td>${inf.platform}</td>
          <td>${inf.followers}</td>
          <td>${(inf.engagement_rate * 100).toFixed(1)}%</td>
          <td>${inf.niche}</td>
          <td>${inf.location}</td>
          <td><button class="btn" onclick="openOutreachForm('${inf.id}', '${inf.name}')">Log Outreach</button></td>
        </tr>`;
    });
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
