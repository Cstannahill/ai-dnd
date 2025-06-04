import React, { useState, useRef, useEffect } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import {
  Users,
  Crosshair,
  Move,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Eye,
  EyeOff,
} from "lucide-react";

interface Token {
  id: string;
  name: string;
  type: "player" | "npc" | "enemy" | "object";
  x: number;
  y: number;
  size: number;
  color: string;
  hp?: number;
  maxHp?: number;
  conditions?: string[];
}

interface MapProps {
  width?: number;
  height?: number;
  gridSize?: number;
}

export function GameMap({
  width = 800,
  height = 600,
  gridSize = 40,
}: MapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tokens, setTokens] = useState<Token[]>([
    {
      id: "player1",
      name: "Aragorn",
      type: "player",
      x: 200,
      y: 200,
      size: 30,
      color: "#3b82f6",
      hp: 45,
      maxHp: 50,
    },
    {
      id: "player2",
      name: "Legolas",
      type: "player",
      x: 240,
      y: 200,
      size: 30,
      color: "#10b981",
      hp: 38,
      maxHp: 40,
    },
    {
      id: "enemy1",
      name: "Orc Warrior",
      type: "enemy",
      x: 400,
      y: 300,
      size: 35,
      color: "#dc2626",
      hp: 15,
      maxHp: 25,
      conditions: ["Wounded"],
    },
    {
      id: "enemy2",
      name: "Orc Archer",
      type: "enemy",
      x: 440,
      y: 260,
      size: 30,
      color: "#dc2626",
      hp: 20,
      maxHp: 20,
    },
  ]);

  const [selectedToken, setSelectedToken] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [mode, setMode] = useState<"select" | "move" | "measure">("select");

  useEffect(() => {
    drawMap();
  }, [tokens, showGrid, zoom, pan, selectedToken]);

  const drawMap = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Save context for transformations
    ctx.save();

    // Apply zoom and pan
    ctx.scale(zoom, zoom);
    ctx.translate(pan.x, pan.y);

    // Draw background
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(
      -pan.x / zoom,
      -pan.y / zoom,
      canvas.width / zoom,
      canvas.height / zoom
    );

    // Draw grid
    if (showGrid) {
      ctx.strokeStyle = "#374151";
      ctx.lineWidth = 1 / zoom;

      const startX = Math.floor(-pan.x / zoom / gridSize) * gridSize;
      const startY = Math.floor(-pan.y / zoom / gridSize) * gridSize;
      const endX = startX + canvas.width / zoom + gridSize;
      const endY = startY + canvas.height / zoom + gridSize;

      for (let x = startX; x <= endX; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, startY);
        ctx.lineTo(x, endY);
        ctx.stroke();
      }

      for (let y = startY; y <= endY; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(startX, y);
        ctx.lineTo(endX, y);
        ctx.stroke();
      }
    }

    // Draw tokens
    tokens.forEach((token) => {
      const isSelected = selectedToken === token.id;

      // Token circle
      ctx.beginPath();
      ctx.arc(token.x, token.y, token.size / 2, 0, 2 * Math.PI);
      ctx.fillStyle = token.color;
      ctx.fill();

      // Selection outline
      if (isSelected) {
        ctx.strokeStyle = "#fbbf24";
        ctx.lineWidth = 3 / zoom;
        ctx.stroke();
      } else {
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 2 / zoom;
        ctx.stroke();
      }

      // Token name
      ctx.fillStyle = "#ffffff";
      ctx.font = `${12 / zoom}px Arial`;
      ctx.textAlign = "center";
      ctx.fillText(token.name, token.x, token.y - token.size / 2 - 8 / zoom);

      // HP bar (if applicable)
      if (token.hp !== undefined && token.maxHp !== undefined) {
        const barWidth = token.size;
        const barHeight = 6 / zoom;
        const hpPercentage = token.hp / token.maxHp;

        // Background
        ctx.fillStyle = "#374151";
        ctx.fillRect(
          token.x - barWidth / 2,
          token.y + token.size / 2 + 4 / zoom,
          barWidth,
          barHeight
        );

        // HP fill
        ctx.fillStyle =
          hpPercentage > 0.5
            ? "#10b981"
            : hpPercentage > 0.25
            ? "#f59e0b"
            : "#dc2626";
        ctx.fillRect(
          token.x - barWidth / 2,
          token.y + token.size / 2 + 4 / zoom,
          barWidth * hpPercentage,
          barHeight
        );
      }

      // Conditions
      if (token.conditions && token.conditions.length > 0) {
        token.conditions.forEach((_, index) => {
          ctx.fillStyle = "#dc2626";
          ctx.beginPath();
          ctx.arc(
            token.x + token.size / 2 - 8 / zoom,
            token.y - token.size / 2 + 8 / zoom + (index * 12) / zoom,
            4 / zoom,
            0,
            2 * Math.PI
          );
          ctx.fill();
        });
      }
    });

    // Restore context
    ctx.restore();
  };

  const getTokenAt = (x: number, y: number): Token | null => {
    const adjustedX = (x - pan.x) / zoom;
    const adjustedY = (y - pan.y) / zoom;

    for (let i = tokens.length - 1; i >= 0; i--) {
      const token = tokens[i];
      const distance = Math.sqrt(
        Math.pow(adjustedX - token.x, 2) + Math.pow(adjustedY - token.y, 2)
      );
      if (distance <= token.size / 2) {
        return token;
      }
    }
    return null;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const token = getTokenAt(x, y);

    if (token && mode === "select") {
      setSelectedToken(token.id);
      setIsDragging(true);
      setDragOffset({
        x: (x - pan.x) / zoom - token.x,
        y: (y - pan.y) / zoom - token.y,
      });
    } else if (mode === "move") {
      setSelectedToken(token?.id || null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !selectedToken) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newX = (x - pan.x) / zoom - dragOffset.x;
    const newY = (y - pan.y) / zoom - dragOffset.y;

    setTokens((prev) =>
      prev.map((token) =>
        token.id === selectedToken ? { ...token, x: newX, y: newY } : token
      )
    );
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoom = (direction: "in" | "out") => {
    const newZoom = direction === "in" ? zoom * 1.2 : zoom / 1.2;
    setZoom(Math.max(0.5, Math.min(3, newZoom)));
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const selectedTokenData = tokens.find((t) => t.id === selectedToken);

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-2 border-b border-gray-600 bg-black/20">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={mode === "select" ? "default" : "outline"}
            onClick={() => setMode("select")}
            className="h-8"
          >
            <Crosshair className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant={mode === "move" ? "default" : "outline"}
            onClick={() => setMode("move")}
            className="h-8"
          >
            <Move className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant={mode === "measure" ? "default" : "outline"}
            onClick={() => setMode("measure")}
            className="h-8"
          >
            <Users className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowGrid(!showGrid)}
            className="h-8"
          >
            {showGrid ? (
              <Eye className="w-4 h-4" />
            ) : (
              <EyeOff className="w-4 h-4" />
            )}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleZoom("out")}
            className="h-8"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleZoom("in")}
            className="h-8"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={resetView}
            className="h-8"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Map Canvas */}
      <div className="flex-1 relative">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="border border-gray-600 cursor-crosshair"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />

        {/* Token Info Panel */}
        {selectedTokenData && (
          <Card className="absolute top-4 right-4 w-48 bg-black/80 border-gray-600">
            <div className="p-3">
              <h3 className="text-white font-medium mb-2">
                {selectedTokenData.name}
              </h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">Type:</span>
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      selectedTokenData.type === "player"
                        ? "text-blue-300 border-blue-500"
                        : selectedTokenData.type === "enemy"
                        ? "text-red-300 border-red-500"
                        : "text-gray-300 border-gray-500"
                    }`}
                  >
                    {selectedTokenData.type}
                  </Badge>
                </div>
                {selectedTokenData.hp !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-gray-300">HP:</span>
                    <span className="text-white">
                      {selectedTokenData.hp}/{selectedTokenData.maxHp}
                    </span>
                  </div>
                )}
                {selectedTokenData.conditions &&
                  selectedTokenData.conditions.length > 0 && (
                    <div>
                      <span className="text-gray-300">Conditions:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedTokenData.conditions.map(
                          (condition, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs text-red-300 border-red-500"
                            >
                              {condition}
                            </Badge>
                          )
                        )}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between p-2 text-xs text-gray-400 border-t border-gray-600 bg-black/20">
        <div className="flex items-center gap-4">
          <span>Mode: {mode}</span>
          <span>Zoom: {Math.round(zoom * 100)}%</span>
          <span>Grid: {showGrid ? "On" : "Off"}</span>
        </div>
        <div className="flex items-center gap-4">
          <span>
            {tokens.filter((t) => t.type === "player").length} Players
          </span>
          <span>{tokens.filter((t) => t.type === "enemy").length} Enemies</span>
        </div>
      </div>
    </div>
  );
}
