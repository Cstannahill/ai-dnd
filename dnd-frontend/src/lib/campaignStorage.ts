export interface CampaignRecord {
  code: string;
  name: string;
  joinedAt: string;
}

export function loadCampaigns(): CampaignRecord[] {
  try {
    return JSON.parse(localStorage.getItem("dnd-campaigns") || "[]");
  } catch {
    return [];
  }
}

export function saveCampaign(campaign: { code: string; name: string }) {
  const campaigns = loadCampaigns();
  if (!campaigns.some((c) => c.code === campaign.code)) {
    campaigns.push({ ...campaign, joinedAt: new Date().toISOString() });
    localStorage.setItem("dnd-campaigns", JSON.stringify(campaigns));
  }
}
