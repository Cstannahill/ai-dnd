import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card";
import { getPublicFineTunedDMs } from "../services/api-mock";

interface PublicDM {
  id: string;
  name: string;
  description: string;
}

export function DMLibrary() {
  const [dms, setDms] = useState<PublicDM[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublicFineTunedDMs()
      .then(setDms)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-white">Community DM Library</h1>
        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : !dms.length ? (
          <p className="text-gray-400">No shared DMs yet.</p>
        ) : (
          <div className="space-y-4">
            {dms.map((dm) => (
              <Card
                key={dm.id}
                className="bg-white/10 backdrop-blur border-purple-500/20"
              >
                <CardHeader>
                  <CardTitle className="text-white">{dm.name}</CardTitle>
                  <CardDescription className="text-gray-300">
                    {dm.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <code className="text-purple-300 font-mono">{dm.id}</code>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
