import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Brain, Save, ArrowLeft, Send } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { ScrollArea } from "../components/ui/scroll-area";
import { AIPersonalitySelector } from "../components/aicomponent/AIPersonalitySelector";
import { PromptEditor } from "../components/aicomponent/PromptEditor";
import { AIModelSelector } from "../components/aicomponent/AIModelSelector";
import { ChatMessage } from "../components/chat/ChatMessage";
import {
  createFineTunedDM,
  testFineTunedDM,
  type FineTuningRequest,
} from "../services/api-mock";

interface SimpleMessage {
  id: string;
  type: "player" | "dm";
  sender: string;
  content: string;
  timestamp: Date;
}

export function FineTuningDemo() {
  const navigate = useNavigate();

  const [personality, setPersonality] = useState("classic");
  const [prompt, setPrompt] = useState("You are a helpful dungeon master.");
  const [keywords, setKeywords] = useState("");
  const [model, setModel] = useState("gpt-4");
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(300);
  const [trainingData, setTrainingData] = useState("");

  const [saving, setSaving] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");
  const [messages, setMessages] = useState<SimpleMessage[]>([]);

  const buildRequest = (): FineTuningRequest => ({
    campaignStyle: personality,
    worldDescription: prompt,
    keyNPCs: [],
    campaignThemes: keywords
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean),
    customPrompts: trainingData
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean),
    model,
    temperature,
    maxTokens,
    trainingData,
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      await createFineTunedDM(buildRequest());
      navigate(-1);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleSendTest = async () => {
    if (!currentMessage.trim()) return;
    const userMsg: SimpleMessage = {
      id: Date.now().toString(),
      type: "player",
      sender: "You",
      content: currentMessage,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setCurrentMessage("");
    const res = await testFineTunedDM(buildRequest(), userMsg.content);
    const aiMsg: SimpleMessage = {
      id: Date.now().toString() + "_ai",
      type: "dm",
      sender: "AI DM",
      content: res.response,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, aiMsg]);
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
            <CardTitle className="text-white">Base Model & Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <AIModelSelector value={model} onValueChange={setModel} />
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">Temperature</label>
              <Input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full"
              />
              <p className="text-xs text-gray-400">Lower values =&gt; consistent. Higher =&gt; creative.</p>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">Max Tokens</label>
              <Input
                type="number"
                min="50"
                max="2000"
                value={maxTokens}
                onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                className="w-24 bg-card border border-border text-primary"
              />
              <p className="text-xs text-gray-400">Controls response length.</p>
            </div>
          </CardContent>
        </Card>

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
            <div className="space-y-2">
              <label className="block text-sm font-medium text-muted-foreground mb-1">Training Examples</label>
              <Textarea
                value={trainingData}
                onChange={(e) => setTrainingData(e.target.value)}
                placeholder="Example conversations or descriptions"
                className="min-h-[100px] bg-card border border-border text-primary"
              />
              <p className="text-xs text-gray-400">
                Provide short samples that capture your world&apos;s tone.
              </p>
            </div>
            <Button onClick={handleSave} disabled={saving} className="mt-4 bg-primary hover:bg-primary/80">
              <Save className="w-4 h-4 mr-2" /> {saving ? "Saving..." : "Save"}
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-black/20 border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-white">Preview Chat</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ScrollArea className="h-64 border border-border rounded-md p-2 bg-black/30">
              <div className="space-y-4">
                {messages.map((m) => (
                  <ChatMessage key={m.id} message={m} />
                ))}
              </div>
            </ScrollArea>
            <div className="flex gap-2">
              <Input
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                placeholder="Ask your DM..."
                className="flex-1 bg-card border border-border"
              />
              <Button onClick={handleSendTest} disabled={!currentMessage.trim()} className="bg-primary hover:bg-primary/80">
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-400">Send a message to see how the AI responds with current settings.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
