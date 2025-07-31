const influencers = [
  { name: "Ava Beauty", platform: "Instagram", followers: 45000, engagement: "4.5%", niche: "Beauty" },
  { name: "FitTom", platform: "TikTok", followers: 32000, engagement: "6.5%", niche: "Fitness" },
  { name: "GameGuru", platform: "YouTube", followers: 60000, engagement: "3.2%", niche: "Gaming" }
];
const tableBody = document.querySelector("#influencer-table tbody");
influencers.forEach(influencer => {
  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${influencer.name}</td>
    <td>${influencer.platform}</td>
    <td>${influencer.followers}</td>
    <td>${influencer.engagement}</td>
    <td>${influencer.niche}</td>`;
  tableBody.appendChild(row);
});
