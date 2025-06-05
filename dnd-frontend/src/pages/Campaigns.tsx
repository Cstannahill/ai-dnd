import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { loadCampaigns, type CampaignRecord } from "../lib/campaignStorage";
import { getRoomInfo } from "../services/api-mock";

interface CampaignInfo extends CampaignRecord {
  players?: number;
  aiModel?: string;
}

export function Campaigns() {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<CampaignInfo[]>([]);

  useEffect(() => {
    const stored = loadCampaigns();
    Promise.all(
      stored.map(async (c) => {
        try {
          const info = await getRoomInfo(c.code);
          return { ...c, players: info.players.length, aiModel: info.aiModel };
        } catch {
          return c;
        }
      })
    ).then(setCampaigns);
  }, []);

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-white">My Campaigns</h1>
        {!campaigns.length ? (
          <p className="text-gray-400">No campaigns joined yet.</p>
        ) : (
          <div className="space-y-4">
            {campaigns.map((c) => (
              <Card
                key={c.code}
                className="bg-white/10 backdrop-blur border-purple-500/20"
              >
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    <span>{c.name}</span>
                    <code className="text-purple-300 font-mono">{c.code}</code>
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    Joined {new Date(c.joinedAt).toLocaleDateString()}
                    {c.players != null && (
                      <> • {c.players} players • {c.aiModel}</>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex gap-2">
                  <Button
                    onClick={() => navigate(`/lobby/${c.code}`)}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Open Lobby
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
