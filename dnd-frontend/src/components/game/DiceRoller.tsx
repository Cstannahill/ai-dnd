import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Card, CardContent } from "../ui/card";
import { Dice6, Plus, Minus } from "lucide-react";

interface DiceRollerProps {
  onRoll: (dice: string, modifier?: number) => void;
}

interface DicePreset {
  name: string;
  dice: string;
  description: string;
}

const DICE_PRESETS: DicePreset[] = [
  { name: "d4", dice: "1d4", description: "Damage die" },
  { name: "d6", dice: "1d6", description: "Damage die" },
  { name: "d8", dice: "1d8", description: "Damage die" },
  { name: "d10", dice: "1d10", description: "Damage die" },
  { name: "d12", dice: "1d12", description: "Damage die" },
  { name: "d20", dice: "1d20", description: "Ability check" },
  { name: "d100", dice: "1d100", description: "Percentile" },
];

const ABILITY_CHECKS = [
  "Strength",
  "Dexterity",
  "Constitution",
  "Intelligence",
  "Wisdom",
  "Charisma",
];

export function DiceRoller({ onRoll }: DiceRollerProps) {
  const [customDice, setCustomDice] = useState("");
  const [modifier, setModifier] = useState(0);
  const [selectedAbility, setSelectedAbility] = useState<string>("");
  const [lastRoll, setLastRoll] = useState<{
    dice: string;
    modifier: number;
  } | null>(null);

  const handleRoll = (dice: string, mod: number = modifier) => {
    onRoll(dice, mod);
    setLastRoll({ dice, modifier: mod });
  };

  const handleCustomRoll = () => {
    if (!customDice.trim()) return;

    // Validate dice format (e.g., 1d20, 2d6, etc.)
    const diceRegex = /^\d+d\d+$/i;
    if (!diceRegex.test(customDice.trim())) {
      alert('Please enter dice in format like "1d20" or "2d6"');
      return;
    }

    handleRoll(customDice.trim());
    setCustomDice("");
  };

  const handleAbilityCheck = () => {
    if (!selectedAbility) return;
    handleRoll("1d20");
  };

  const adjustModifier = (delta: number) => {
    setModifier((prev) => Math.max(-10, Math.min(10, prev + delta)));
  };

  return (
    <div className="space-y-4">
      {/* Quick Dice */}
      <div>
        <h4 className="text-sm font-medium text-gray-300 mb-2">Quick Roll</h4>
        <div className="grid grid-cols-4 gap-1">
          {DICE_PRESETS.map((preset) => (
            <Button
              key={preset.name}
              size="sm"
              variant="outline"
              onClick={() => handleRoll(preset.dice)}
              className="text-xs border-gray-600 text-gray-300 hover:bg-gray-700"
              title={preset.description}
            >
              {preset.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Modifier */}
      <div>
        <h4 className="text-sm font-medium text-gray-300 mb-2">Modifier</h4>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => adjustModifier(-1)}
            className="w-8 h-8 p-0 border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <Minus className="w-3 h-3" />
          </Button>
          <span className="text-center text-white font-mono w-8">
            {modifier >= 0 ? "+" : ""}
            {modifier}
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => adjustModifier(1)}
            className="w-8 h-8 p-0 border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <Plus className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Ability Checks */}
      <div>
        <h4 className="text-sm font-medium text-gray-300 mb-2">
          Ability Check
        </h4>
        <div className="flex gap-2">
          <Select value={selectedAbility} onValueChange={setSelectedAbility}>
            <SelectTrigger className="bg-white/5 border-gray-600 text-white text-xs">
              <SelectValue placeholder="Select ability..." />
            </SelectTrigger>
            <SelectContent>
              {ABILITY_CHECKS.map((ability) => (
                <SelectItem key={ability} value={ability}>
                  {ability}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            size="sm"
            onClick={handleAbilityCheck}
            disabled={!selectedAbility}
            className="bg-blue-600 hover:bg-blue-700 text-xs"
          >
            Roll
          </Button>
        </div>
      </div>

      {/* Custom Dice */}
      <div>
        <h4 className="text-sm font-medium text-gray-300 mb-2">Custom Dice</h4>
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="e.g., 2d6"
            value={customDice}
            onChange={(e) => setCustomDice(e.target.value)}
            className="bg-white/5 border-gray-600 text-white placeholder-gray-400 text-xs"
            onKeyPress={(e) => e.key === "Enter" && handleCustomRoll()}
          />
          <Button
            size="sm"
            onClick={handleCustomRoll}
            disabled={!customDice.trim()}
            className="bg-purple-600 hover:bg-purple-700 text-xs"
          >
            <Dice6 className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Last Roll */}
      {lastRoll && (
        <Card className="bg-white/5 border-gray-600">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-400">Last Roll:</div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleRoll(lastRoll.dice, lastRoll.modifier)}
                className="text-xs text-gray-300 hover:text-white"
              >
                {lastRoll.dice}
                {lastRoll.modifier !== 0 && (
                  <span className="ml-1">
                    {lastRoll.modifier > 0 ? "+" : ""}
                    {lastRoll.modifier}
                  </span>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Common Rolls */}
      <div>
        <h4 className="text-sm font-medium text-gray-300 mb-2">
          Common Checks
        </h4>
        <div className="space-y-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleRoll("1d20")}
            className="w-full justify-start text-xs text-gray-300 hover:text-white"
          >
            Attack Roll (d20)
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleRoll("1d20")}
            className="w-full justify-start text-xs text-gray-300 hover:text-white"
          >
            Saving Throw (d20)
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleRoll("1d4")}
            className="w-full justify-start text-xs text-gray-300 hover:text-white"
          >
            Inspiration (d4)
          </Button>
        </div>
      </div>
    </div>
  );
}
