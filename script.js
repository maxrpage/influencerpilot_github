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

// Save selected influencers to campaign
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
};

// Update outreach status live
window.updateInfluencerStatus = async function (selectEl) {
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
};

// Load outreach data for campaign
async function loadCampaignInfluencers(campaignId) {
  const { data, error } = await client
    .from("campaign_influencers")
    .select("id, status, influencer:influencer_id(name, platform)")
    .eq("campaign_id", campaignId);

  const list = document.getElementById("campaign-influencer-list");
  if (!list) return;
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

// Export outreach progress as CSV
window.exportCampaignCSV = async function () {
  const { data: session } = await client.auth.getSession();
  const user = session.session?.user;
  if (!user) return alert("You must be logged in.");

  const { data: campaigns } = await client.from("campaigns")
    .select("id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1);

  const campaign = campaigns?.[0];
  if (!campaign) return alert("No campaign found.");

  const { data, error } = await client
    .from("campaign_influencers")
    .select("status, influencer:influencer_id(name, platform, followers, niche, location)")
    .eq("campaign_id", campaign.id);

  if (error || !data) {
    console.error(error);
    return alert("Failed to fetch campaign data.");
  }

  const rows = [["Name", "Platform", "Followers", "Niche", "Location", "Status"]];
  data.forEach(entry => {
    rows.push([
      entry.influencer.name,
      entry.influencer.platform,
      entry.influencer.followers,
      entry.influencer.niche,
      entry.influencer.location,
      entry.status
    ]);
  });

  const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "campaign_outreach.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Load session and campaigns on page load
window.onload = function () {
  loadInfluencers();

  client.auth.getSession().then(({ data }) => {
    const user = data.session?.user;
    if (user) {
      document.getElementById("auth-section").style.display = "none";
      document.getElementById("user-dashboard").style.display = "block";
      document.getElementById("user-email").innerText = user.email;

      client.from("campaigns").select("id").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1)
        .then(({ data }) => {
          const campaign = data?.[0];
          if (campaign) {
            loadCampaignInfluencers(campaign.id);
          }
        });
    }
  });
};

// Load influencer options for email generator
async function populateInfluencerDropdown() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/influencers?select=*`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`
    }
  });
  const influencers = await res.json();
  const dropdown = document.getElementById("email-influencer-select");
  if (!dropdown) return;
  dropdown.innerHTML = influencers.map(inf => 
    `<option value="${inf.id}" data-name="${inf.name}" data-platform="${inf.platform}" data-niche="${inf.niche}">${inf.name} (${inf.platform})</option>`
  ).join('');
}

// Generate outreach email text
window.generateOutreachEmail = function () {
  const select = document.getElementById("email-influencer-select");
  const selected = select.options[select.selectedIndex];
  const name = selected.getAttribute("data-name");
  const platform = selected.getAttribute("data-platform");
  const niche = selected.getAttribute("data-niche");

  const message = `Hi ${name},

I've been following your content on ${platform}, and I'm really impressed by your work in the ${niche} space. I’m reaching out about a collaboration opportunity that aligns with your brand and values. Let me know if you’d be open to chatting more!

Best,
[Your Name]`;

  document.getElementById("email-output").textContent = message;
};


// Campaign summary
async function loadCampaignSummary(campaignId) {
  const { data, error } = await client
    .from("campaign_influencers")
    .select("status");

  if (error || !data) return;

  const total = data.length;
  const confirmed = data.filter(d => d.status === "Confirmed").length;
  const emailed = data.filter(d => d.status === "Emailed").length;
  const negotiating = data.filter(d => d.status === "Negotiating").length;

  document.getElementById("summary-metrics").innerHTML = `
    <ul>
      <li><strong>Total:</strong> ${total}</li>
      <li><strong>Confirmed:</strong> ${confirmed}</li>
      <li><strong>Emailed:</strong> ${emailed}</li>
      <li><strong>Negotiating:</strong> ${negotiating}</li>
    </ul>
  `;
}