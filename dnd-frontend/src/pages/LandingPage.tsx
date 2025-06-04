import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Brain, Sparkles, Github, User, Users } from "lucide-react";
// import { createRoom, joinRoom } from "../services/api";
import { createRoom, joinRoom } from "../services/api-mock";
import ctanDndMain from "/ctan-dnd-main.png?url";
import { saveCampaign } from "../lib/campaignStorage";

export function LandingPage() {
  const navigate = useNavigate();
  const [roomName, setRoomName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreateRoom = async () => {
    if (!roomName.trim()) return;

    setLoading(true);
    try {
      const room = await createRoom(roomName);
      saveCampaign({ code: room.code, name: room.name });
      navigate(`/lobby/${room.code}`);
    } catch (error) {
      console.error("Failed to create room:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!joinCode.trim()) return;

    setLoading(true);
    try {
      const room = await joinRoom(joinCode);
      saveCampaign({ code: joinCode, name: room.name });
      navigate(`/lobby/${joinCode}`);
    } catch (error) {
      console.error("Failed to join room:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background text-foreground">
      <div className="max-w-4xl mx-auto shadow-lg rounded-lg border border-border bg-card">
        {/* Hero Section */}
        <div className="text-center mb-12 mt-2">
          <div className="flex items-center justify-center mb-6">
            <img
              src={ctanDndMain}
              alt="Brand Icon"
              className="w-16 h-16 mr-4"
            />
            <h1 className="text-6xl font-bold text-primary">
              AI<span className="text-secondary">DM</span>
            </h1>
          </div>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Experience D&D 5E like never before with an AI Dungeon Master that
            creates immersive adventures in real-time. Play with friends or solo
            - the AI adapts to your choices.
          </p>

          {/* Feature Highlights */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="flex flex-col items-center p-6 rounded-lg bg-card shadow-md">
              <Brain className="w-12 h-12 text-primary mb-3" />
              <h3 className="text-lg font-semibold text-primary mb-2">
                AI Dungeon Master
              </h3>
              <p className="text-muted-foreground text-sm">
                Powered by advanced AI that remembers your story and creates
                dynamic encounters
              </p>
            </div>
            <div className="flex flex-col items-center p-6 rounded-lg bg-card shadow-md">
              <Users className="w-12 h-12 text-primary mb-3" />
              <h3 className="text-lg font-semibold text-primary mb-2">
                Multiplayer Ready
              </h3>
              <p className="text-muted-foreground text-sm">
                Create private rooms and adventure with friends in real-time
              </p>
            </div>
            <div className="flex flex-col items-center p-6 rounded-lg bg-card shadow-md">
              <Sparkles className="w-12 h-12 text-primary mb-3" />
              <h3 className="text-lg font-semibold text-primary mb-2">
                Automated Tools
              </h3>
              <p className="text-muted-foreground text-sm">
                Digital character sheets, dice rolling, and session management
                built-in
              </p>
            </div>
          </div>
        </div>

        {/* Main Action Card */}
        <Card className="bg-card border border-border shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-primary">
              Start Your Adventure
            </CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              Create a new campaign or join an existing one
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="create" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="create">Create Room</TabsTrigger>
                <TabsTrigger value="join">Join Room</TabsTrigger>
              </TabsList>

              <TabsContent value="create" className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Campaign Name
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter your campaign name..."
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    className="bg-card border border-border text-primary placeholder-muted-foreground"
                    onKeyPress={(e) => e.key === "Enter" && handleCreateRoom()}
                  />
                </div>
                <Button
                  onClick={handleCreateRoom}
                  disabled={!roomName.trim() || loading}
                  className="w-full bg-primary hover:bg-primary-foreground text-primary-foreground"
                >
                  {loading ? "Creating..." : "Create Adventure"}
                </Button>
              </TabsContent>

              <TabsContent value="join" className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Room Code
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter room code..."
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    className="bg-card border border-border text-primary placeholder-muted-foreground"
                    onKeyPress={(e) => e.key === "Enter" && handleJoinRoom()}
                  />
                </div>
                <Button
                  onClick={handleJoinRoom}
                  disabled={!joinCode.trim() || loading}
                  className="w-full bg-secondary hover:bg-secondary-foreground text-secondary-foreground"
                >
                  {loading ? "Joining..." : "Join Adventure"}
                </Button>
              </TabsContent>
            </Tabs>

            {/* Demo Features */}
            <div className="mt-8 pt-6 border-t border-border">
              <h4 className="text-lg font-semibold text-primary mb-4 text-center">
                Try Our Demo Features
              </h4>
              <div className="flex gap-4 justify-center">
                <Button
                  variant="outline"
                  onClick={() => navigate("/characters")}
                  className="border-primary text-primary hover:bg-primary/20"
                >
                  <User className="w-4 h-4 mr-2" />
                  Character Library
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/fine-tune")}
                  className="border-secondary text-secondary hover:bg-secondary/20"
                >
                  <Brain className="w-4 h-4 mr-2" />
                  Fine-Tune AI DM
                </Button>
                <Button
                  variant="outline"
                  asChild
                  className="border-muted text-muted hover:bg-muted/20"
                >
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Github className="w-4 h-4 mr-2" />
                    View Source
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-muted-foreground text-sm">
          <p>Open source • Free to use • No account required</p>
          <p className="mt-2">
            Built with React, TypeScript, and AI • Supports D&D 5th Edition
          </p>
        </div>
      </div>
    </div>
  );
}
