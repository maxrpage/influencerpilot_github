
// Supabase setup
const SUPABASE_URL = "https://ejvvdrwkucrxpwcfwhco.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Outreach modal UI logic
function openOutreachForm(influencerId, name) {
  document.getElementById("outreach-modal").style.display = "block";
  document.getElementById("outreach-influencer-id").value = influencerId;
  document.getElementById("outreach-influencer-name").textContent = name;
}

function closeOutreachForm() {
  document.getElementById("outreach-modal").style.display = "none";
}

// Submit outreach to Supabase
async function submitOutreach() {
  const influencerId = document.getElementById("outreach-influencer-id").value;
  const contactMethod = document.getElementById("outreach-method").value;
  const notes = document.getElementById("outreach-notes").value;
  const status = document.getElementById("outreach-status").value;

  const user = supabase.auth.getUser();
  const { data, error } = await supabase.from("outreach").insert([
    {
      influencer_id: influencerId,
      contact_method: contactMethod,
      notes,
      status,
    },
  ]);

  if (error) {
    alert("Failed to log outreach: " + error.message);
  } else {
    alert("Outreach logged!");
    closeOutreachForm();
  }
}
