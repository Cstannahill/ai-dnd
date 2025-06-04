import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { Users, Settings, Play, Copy, CheckCircle, Brain } from "lucide-react";
import { useSocket } from "../hooks/useSocket";
import { CharacterSheet } from "../components/character/CharacterSheet";
import { AIModelSelector } from "../components/aicomponent/AIModelSelector";

interface Player {
  id: string;
  name: string;
  character?: {
    name: string;
    class: string;
    level: number;
    ready: boolean;
  };
}

interface Room {
  code: string;
  name: string;
  host: string;
  players: Player[];
  aiModel: string;
  status: "waiting" | "ready" | "playing";
}

export function GameLobby() {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();
  const [playerName, setPlayerName] = useState("");
  const [joined, setJoined] = useState(false);
  const [copied, setCopied] = useState(false);
  const [room, setRoom] = useState<Room | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);

  const { socket, connected, emit } = useSocket();

  useEffect(() => {
    if (!connected || !roomCode) return;

    emit("join-lobby", { roomCode });

    const handleRoomUpdated = (updatedRoom: Room) => {
      setRoom(updatedRoom);
    };

    const handlePlayerJoined = (player: Player) => {
      setCurrentPlayer(player);
      setJoined(true);
    };

    socket?.on("room-updated", handleRoomUpdated);
    socket?.on("player-joined", handlePlayerJoined);

    return () => {
      socket?.off("room-updated", handleRoomUpdated);
      socket?.off("player-joined", handlePlayerJoined);
    };
  }, [socket, connected, roomCode, emit]);

  const handleJoinLobby = () => {
    if (!playerName.trim() || !connected) return;

    emit("join-as-player", {
      roomCode,
      playerName: playerName.trim(),
    });
  };

  const handleStartGame = () => {
    if (!connected || !room) return;

    emit("start-game", { roomCode });
    navigate(`/game/${roomCode}`);
  };

  const handleCopyCode = () => {
    if (roomCode) {
      navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isHost = currentPlayer?.id === room?.host;
  const allPlayersReady =
    room?.players.every((p) => p.character?.ready) && room.players.length > 0;

  if (!joined) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/10 backdrop-blur border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-white">
              Join Game
            </CardTitle>
            <CardDescription className="text-center text-gray-300">
              Room:{" "}
              <span className="font-mono text-purple-300">{roomCode}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Your Name
              </label>
              <Input
                type="text"
                placeholder="Enter your player name..."
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="bg-white/5 border-gray-600 text-white placeholder-gray-400"
                onKeyPress={(e) => e.key === "Enter" && handleJoinLobby()}
              />
            </div>
            <Button
              onClick={handleJoinLobby}
              disabled={!playerName.trim() || !connected}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              Join Adventure
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{room?.name}</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-gray-300">Room Code:</span>
                <code className="bg-purple-900/30 px-2 py-1 rounded text-purple-300 font-mono">
                  {roomCode}
                </code>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCopyCode}
                  className="text-gray-400 hover:text-white"
                >
                  {copied ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <Badge
                variant="secondary"
                className="bg-green-900/30 text-green-300"
              >
                <Users className="w-3 h-3 mr-1" />
                {room?.players.length || 0} Players
              </Badge>
            </div>
          </div>

          {isHost && (
            <Button
              onClick={handleStartGame}
              disabled={!allPlayersReady || !connected}
              className="bg-green-600 hover:bg-green-700"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Adventure
            </Button>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="character" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="character">Character</TabsTrigger>
                <TabsTrigger value="settings">Game Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="character">
                <Card className="bg-white/10 backdrop-blur border-purple-500/20">
                  <CardHeader>
                    <CardTitle className="text-white">
                      Character Setup
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                      Create or import your D&D 5E character
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CharacterSheet
                      onCharacterUpdate={(character) => {
                        if (connected) {
                          emit("update-character", {
                            roomCode,
                            character,
                          });
                        }
                      }}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings">
                <Card className="bg-white/10 backdrop-blur border-purple-500/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Settings className="w-5 h-5 mr-2" />
                      Game Settings
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                      Configure AI DM and game preferences
                      {!isHost && " (Host only)"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <AIModelSelector
                      disabled={!isHost}
                      value={room?.aiModel || "gpt-4"}
                      onValueChange={(model) => {
                        if (connected && isHost) {
                          emit("update-ai-model", {
                            roomCode,
                            aiModel: model,
                          });
                        }
                      }}
                    />

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Campaign Style
                      </label>
                      <Select disabled={!isHost}>
                        <SelectTrigger className="bg-white/5 border-gray-600 text-white">
                          <SelectValue placeholder="Select campaign style..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="classic">
                            Classic Fantasy
                          </SelectItem>
                          <SelectItem value="tolkien">
                            Tolkien-inspired
                          </SelectItem>
                          <SelectItem value="grimdark">Grimdark</SelectItem>
                          <SelectItem value="heroic">
                            Heroic Adventure
                          </SelectItem>
                          <SelectItem value="custom">Custom Style</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Difficulty Level
                      </label>
                      <Select disabled={!isHost}>
                        <SelectTrigger className="bg-white/5 border-gray-600 text-white">
                          <SelectValue placeholder="Select difficulty..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="easy">
                            Easy (New Players)
                          </SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="hard">Hard</SelectItem>
                          <SelectItem value="deadly">Deadly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {isHost && (
                      <Button
                        variant="outline"
                        onClick={() => navigate("/fine-tune")}
                        className="w-full border-purple-500/50 text-purple-300 hover:bg-purple-500/20"
                      >
                        <Brain className="w-4 h-4 mr-2" />
                        Customize AI DM
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Players Panel */}
          <div>
            <Card className="bg-white/10 backdrop-blur border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Players ({room?.players.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {room?.players.map((player) => (
                    <div
                      key={player.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-white/5"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white">
                            {player.name}
                          </span>
                          {player.id === room.host && (
                            <Badge variant="outline" className="text-xs">
                              Host
                            </Badge>
                          )}
                        </div>
                        {player.character && (
                          <div className="text-sm text-gray-400">
                            {player.character.name} • Level{" "}
                            {player.character.level} {player.character.class}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {player.character?.ready ? (
                          <Badge className="bg-green-900/30 text-green-300">
                            Ready
                          </Badge>
                        ) : (
                          <Badge
                            variant="secondary"
                            className="bg-yellow-900/30 text-yellow-300"
                          >
                            Setup
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}

                  {!room?.players.length && (
                    <div className="text-center text-gray-400 py-8">
                      <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Waiting for players to join...</p>
                    </div>
                  )}
                </div>

                {/* AI DM Status */}
                <div className="mt-6 pt-4 border-t border-gray-600">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-purple-900/20">
                    <div className="flex items-center gap-2">
                      <Brain className="w-5 h-5 text-purple-400" />
                      <span className="font-medium text-white">
                        AI Dungeon Master
                      </span>
                    </div>
                    <Badge className="bg-purple-900/30 text-purple-300">
                      Ready
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
