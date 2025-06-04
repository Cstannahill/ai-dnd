import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { ScrollArea } from "../components/ui/scroll-area";
import { Badge } from "../components/ui/badge";
import { Send, Dice6, Users, Map, BookOpen, Brain, Sword } from "lucide-react";
import { useSocket } from "../hooks/useSocket";
import { CharacterPanel } from "../components/character/CharacterPanel";
import { DiceRoller } from "../components/game/DiceRoller";
import { GameMap } from "../components/game/GameMap";
import { ChatMessage } from "../components/chat/ChatMessage";

interface GameMessage {
  id: string;
  type: "player" | "dm" | "system" | "dice";
  sender?: string;
  content: string;
  timestamp: Date;
  metadata?: {
    diceRoll?: {
      dice: string;
      result: number;
      modifier?: number;
    };
    characterAction?: boolean;
  };
}

interface GameState {
  roomCode: string;
  phase: "exploration" | "combat" | "social";
  turn?: {
    currentPlayer: string;
    initiative: Array<{ id: string; name: string; initiative: number }>;
  };
  environment?: {
    location: string;
    description: string;
    lighting: string;
  };
}

export function GameRoom() {
  const { roomCode } = useParams<{ roomCode: string }>();
  const [messages, setMessages] = useState<GameMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket || !roomCode) return;

    // Join the game room
    socket.emit("join-game-room", { roomCode });

    // Listen for game events
    socket.on("game-message", (message: GameMessage) => {
      setMessages((prev) => [...prev, message]);
      setIsAIThinking(false);
    });

    socket.on("game-state-updated", (state: GameState) => {
      setGameState(state);
    });

    socket.on("ai-thinking", () => {
      setIsAIThinking(true);
    });

    // Initialize with welcome message
    const welcomeMessage: GameMessage = {
      id: "welcome",
      type: "dm",
      sender: "AI Dungeon Master",
      content:
        "Welcome, brave adventurers! Your journey begins now. The ancient tavern door creaks open as you step into a world of endless possibilities. What would you like to do?",
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);

    return () => {
      socket.off("game-message");
      socket.off("game-state-updated");
      socket.off("ai-thinking");
    };
  }, [socket, roomCode]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!currentMessage.trim() || !socket) return;

    const message: GameMessage = {
      id: Date.now().toString(),
      type: "player",
      sender: "You", // This would be the actual player name
      content: currentMessage,
      timestamp: new Date(),
    };

    socket.emit("player-action", {
      roomCode,
      message: currentMessage,
      messageId: message.id,
    });

    setMessages((prev) => [...prev, message]);
    setCurrentMessage("");
    setIsAIThinking(true);
  };

  const handleDiceRoll = (dice: string, modifier: number = 0) => {
    if (!socket) return;

    socket.emit("dice-roll", {
      roomCode,
      dice,
      modifier,
    });
  };

  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case "dm":
        return "text-purple-300";
      case "player":
        return "text-blue-300";
      case "system":
        return "text-gray-400";
      case "dice":
        return "text-green-300";
      default:
        return "text-white";
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-purple-500/20 bg-black/20">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-white">Adventure Room</h1>
          <Badge
            variant="outline"
            className="text-purple-300 border-purple-500/50"
          >
            {roomCode}
          </Badge>
          {gameState?.phase && (
            <Badge
              className={`${
                gameState.phase === "combat"
                  ? "bg-red-900/30 text-red-300"
                  : gameState.phase === "social"
                  ? "bg-blue-900/30 text-blue-300"
                  : "bg-green-900/30 text-green-300"
              }`}
            >
              {gameState.phase.charAt(0).toUpperCase() +
                gameState.phase.slice(1)}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-400" />
          <span className="text-gray-400">4 players</span>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex-1 flex flex-col"
          >
            <TabsList className="m-4 mb-0 self-start">
              <TabsTrigger value="chat" className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Adventure Log
              </TabsTrigger>
              <TabsTrigger value="map" className="flex items-center gap-2">
                <Map className="w-4 h-4" />
                Map
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="flex-1 flex flex-col m-4 mt-2">
              <Card className="flex-1 flex flex-col bg-black/20 border-purple-500/20">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center gap-2">
                      <Brain className="w-5 h-5 text-purple-400" />
                      Game Chat
                    </CardTitle>
                    {gameState?.environment && (
                      <div className="text-sm text-gray-400">
                        📍 {gameState.environment.location}
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col p-0">
                  <ScrollArea className="flex-1 px-4">
                    <div className="space-y-4 pb-4">
                      {messages.map((message) => (
                        <ChatMessage
                          key={message.id}
                          message={message}
                          className={getMessageTypeColor(message.type)}
                        />
                      ))}

                      {isAIThinking && (
                        <div className="flex items-center gap-2 text-purple-400 italic">
                          <Brain className="w-4 h-4 animate-pulse" />
                          <span>The Dungeon Master is thinking...</span>
                        </div>
                      )}

                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  {/* Message Input */}
                  <div className="p-4 border-t border-purple-500/20">
                    <div className="flex gap-2">
                      <Input
                        value={currentMessage}
                        onChange={(e) => setCurrentMessage(e.target.value)}
                        placeholder="Describe your action..."
                        className="flex-1 bg-white/5 border-gray-600 text-white placeholder-gray-400"
                        onKeyPress={(e) =>
                          e.key === "Enter" && handleSendMessage()
                        }
                        disabled={isAIThinking}
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!currentMessage.trim() || isAIThinking}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex gap-2 mt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setCurrentMessage("I look around carefully.")
                        }
                        className="text-xs border-gray-600 text-gray-300 hover:bg-gray-700"
                      >
                        👁️ Look Around
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setCurrentMessage("I search for anything unusual.")
                        }
                        className="text-xs border-gray-600 text-gray-300 hover:bg-gray-700"
                      >
                        🔍 Search
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setCurrentMessage(
                            "I listen carefully for any sounds."
                          )
                        }
                        className="text-xs border-gray-600 text-gray-300 hover:bg-gray-700"
                      >
                        👂 Listen
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="map" className="flex-1 m-4 mt-2">
              <Card className="h-full bg-black/20 border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Map className="w-5 h-5 text-purple-400" />
                    Battle Map
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <GameMap />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 border-l border-purple-500/20 bg-black/10 flex flex-col">
          <Tabs defaultValue="character" className="flex-1 flex flex-col">
            <TabsList className="m-4 mb-2 grid grid-cols-2">
              <TabsTrigger value="character">Character</TabsTrigger>
              <TabsTrigger value="tools">Tools</TabsTrigger>
            </TabsList>

            <TabsContent value="character" className="flex-1 mx-4 mb-4">
              <CharacterPanel />
            </TabsContent>

            <TabsContent value="tools" className="flex-1 mx-4 mb-4 space-y-4">
              {/* Dice Roller */}
              <Card className="bg-white/5 border-gray-600">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <Dice6 className="w-4 h-4" />
                    Dice Roller
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <DiceRoller onRoll={handleDiceRoll} />
                </CardContent>
              </Card>

              {/* Combat Tracker */}
              {gameState?.phase === "combat" && (
                <Card className="bg-red-900/10 border-red-500/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white text-sm flex items-center gap-2">
                      <Sword className="w-4 h-4 text-red-400" />
                      Initiative Tracker
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {gameState.turn?.initiative.map((participant) => (
                        <div
                          key={participant.id}
                          className={`flex items-center justify-between p-2 rounded ${
                            participant.id === gameState.turn?.currentPlayer
                              ? "bg-red-500/20 border border-red-500/50"
                              : "bg-white/5"
                          }`}
                        >
                          <span className="text-white text-sm font-medium">
                            {participant.name}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {participant.initiative}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Quick References */}
              <Card className="bg-white/5 border-gray-600">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm">
                    Quick Reference
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-full justify-start text-xs text-gray-300 hover:text-white"
                  >
                    📜 Spell List
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-full justify-start text-xs text-gray-300 hover:text-white"
                  >
                    ⚔️ Combat Actions
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-full justify-start text-xs text-gray-300 hover:text-white"
                  >
                    🎯 Conditions
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
