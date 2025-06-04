import { useState } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { AIPersonalitySelector } from "../components/aicomponent/AIPersonalitySelector";
import { PromptEditor } from "../components/aicomponent/PromptEditor";
import { useNavigate } from "react-router-dom";
import { Brain, Save, ArrowLeft } from "lucide-react";

export function FineTuningDemo() {
  const navigate = useNavigate();
  const [personality, setPersonality] = useState("classic");
  const [prompt, setPrompt] = useState("You are a helpful dungeon master.");
  const [keywords, setKeywords] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      navigate(-1);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate(-1)} className="text-gray-300 hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Brain className="w-6 h-6" /> Fine-Tune AI DM
          </h1>
        </div>

        <Card className="bg-black/20 border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-white">Personality & Prompt</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <AIPersonalitySelector value={personality} onChange={setPersonality} />
            <PromptEditor value={prompt} onChange={setPrompt} />
            <div className="space-y-2">
              <label className="block text-sm font-medium text-muted-foreground mb-1">Keywords</label>
              <Input
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="dark, mysterious, undead..."
                className="bg-card border border-border text-primary"
              />
            </div>
            <Button onClick={handleSave} disabled={saving} className="mt-4 bg-primary hover:bg-primary/80">
              <Save className="w-4 h-4 mr-2" /> {saving ? "Saving..." : "Save"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
