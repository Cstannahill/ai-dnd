import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Textarea } from "../ui/textarea";
import {
  Dice6,
  Plus,
  Minus,
  Save,
  CheckCircle,
  Heart,
  Shield,
  Zap,
} from "lucide-react";
import type { Character } from "../../services/api";

interface CharacterSheetProps {
  onCharacterUpdate?: (character: Character & { ready: boolean }) => void;
  initialCharacter?: Character;
}

const D5E_CLASSES = [
  "Barbarian",
  "Bard",
  "Cleric",
  "Druid",
  "Fighter",
  "Monk",
  "Paladin",
  "Ranger",
  "Rogue",
  "Sorcerer",
  "Warlock",
  "Wizard",
];

const D5E_RACES = [
  "Human",
  "Elf",
  "Dwarf",
  "Halfling",
  "Dragonborn",
  "Gnome",
  "Half-Elf",
  "Half-Orc",
  "Tiefling",
];

const D5E_BACKGROUNDS = [
  "Acolyte",
  "Criminal",
  "Folk Hero",
  "Noble",
  "Sage",
  "Soldier",
  "Charlatan",
  "Entertainer",
  "Guild Artisan",
  "Hermit",
  "Outlander",
  "Sailor",
];

const STAT_NAMES = [
  "strength",
  "dexterity",
  "constitution",
  "intelligence",
  "wisdom",
  "charisma",
] as const;

export function CharacterSheet({
  onCharacterUpdate,
  initialCharacter,
}: CharacterSheetProps) {
  const [character, setCharacter] = useState<Character>({
    name: "",
    race: "",
    class: "",
    level: 1,
    stats: {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
    },
    hitPoints: {
      current: 8,
      maximum: 8,
      temporary: 0,
    },
    armorClass: 10,
    proficiencyBonus: 2,
    savingThrows: {},
    skills: {},
    equipment: [],
    background: "",
    backstory: "",
    ...initialCharacter,
  });

  const [ready, setReady] = useState(false);
  const [activeTab, setActiveTab] = useState("basics");
  const [newEquipment, setNewEquipment] = useState("");

  useEffect(() => {
    // Calculate derived stats when character changes
    const updatedCharacter = calculateDerivedStats(character);
    if (JSON.stringify(updatedCharacter) !== JSON.stringify(character)) {
      setCharacter(updatedCharacter);
    }
  }, [character.stats, character.level, character.class]);

  const calculateDerivedStats = (char: Character): Character => {
    const updated = { ...char };

    // Calculate modifiers
    const getModifier = (score: number) => Math.floor((score - 10) / 2);

    // Update hit points based on level and constitution
    const conModifier = getModifier(char.stats.constitution);
    const baseHP = char.level === 1 ? 8 : 8 + (char.level - 1) * 5; // Simplified calculation
    updated.hitPoints.maximum = baseHP + conModifier * char.level;

    if (updated.hitPoints.current > updated.hitPoints.maximum) {
      updated.hitPoints.current = updated.hitPoints.maximum;
    }

    // Calculate AC (simplified - 10 + dex modifier)
    updated.armorClass = 10 + getModifier(char.stats.dexterity);

    // Update proficiency bonus based on level
    updated.proficiencyBonus = Math.ceil(char.level / 4) + 1;

    return updated;
  };

  const rollStats = () => {
    const newStats = { ...character.stats };
    STAT_NAMES.forEach((stat) => {
      // Roll 4d6, drop lowest
      const rolls = Array.from(
        { length: 4 },
        () => Math.floor(Math.random() * 6) + 1
      );
      rolls.sort((a, b) => b - a);
      newStats[stat] = rolls.slice(0, 3).reduce((sum, roll) => sum + roll, 0);
    });

    setCharacter((prev) => ({ ...prev, stats: newStats }));
  };

  const updateStat = (stat: keyof typeof character.stats, value: number) => {
    setCharacter((prev) => ({
      ...prev,
      stats: {
        ...prev.stats,
        [stat]: Math.max(3, Math.min(20, value)),
      },
    }));
  };

  const getModifier = (score: number) => {
    const modifier = Math.floor((score - 10) / 2);
    return modifier >= 0 ? `+${modifier}` : `${modifier}`;
  };

  const handleReadyToggle = () => {
    const newReady = !ready;
    setReady(newReady);

    if (onCharacterUpdate) {
      onCharacterUpdate({ ...character, ready: newReady });
    }
  };

  const isCharacterValid = () => {
    return (
      character.name.trim() !== "" &&
      character.race !== "" &&
      character.class !== "" &&
      character.background !== ""
    );
  };

  const addEquipment = () => {
    if (newEquipment.trim()) {
      setCharacter((prev) => ({
        ...prev,
        equipment: [
          ...prev.equipment,
          { name: newEquipment.trim(), quantity: 1 },
        ],
      }));
      setNewEquipment("");
    }
  };

  const removeEquipment = (index: number) => {
    setCharacter((prev) => ({
      ...prev,
      equipment: prev.equipment.filter((_, i) => i !== index),
    }));
  };

  const updateHitPoints = (type: "current" | "temporary", value: number) => {
    setCharacter((prev) => ({
      ...prev,
      hitPoints: {
        ...prev.hitPoints,
        [type]: Math.max(0, value),
      },
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Character Sheet</h3>
        <div className="flex items-center gap-2">
          {isCharacterValid() && (
            <Button
              variant={ready ? "default" : "outline"}
              size="sm"
              onClick={handleReadyToggle}
              className={
                ready
                  ? "bg-green-600 hover:bg-green-700"
                  : "border-green-500/50 text-green-300 hover:bg-green-500/20"
              }
            >
              {ready ? (
                <CheckCircle className="w-4 h-4 mr-1" />
              ) : (
                <Save className="w-4 h-4 mr-1" />
              )}
              {ready ? "Ready!" : "Mark Ready"}
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basics">Basics</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
          <TabsTrigger value="equipment">Equipment</TabsTrigger>
          <TabsTrigger value="backstory">Backstory</TabsTrigger>
        </TabsList>

        <TabsContent value="basics" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Name
              </label>
              <Input
                value={character.name}
                onChange={(e) =>
                  setCharacter((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Character name"
                className="bg-white/5 border-gray-600 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Level
              </label>
              <Select
                value={character.level.toString()}
                onValueChange={(value) =>
                  setCharacter((prev) => ({ ...prev, level: parseInt(value) }))
                }
              >
                <SelectTrigger className="bg-white/5 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 20 }, (_, i) => i + 1).map((level) => (
                    <SelectItem key={level} value={level.toString()}>
                      Level {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Race
              </label>
              <Select
                value={character.race}
                onValueChange={(value) =>
                  setCharacter((prev) => ({ ...prev, race: value }))
                }
              >
                <SelectTrigger className="bg-white/5 border-gray-600 text-white">
                  <SelectValue placeholder="Select race" />
                </SelectTrigger>
                <SelectContent>
                  {D5E_RACES.map((race) => (
                    <SelectItem key={race} value={race}>
                      {race}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Class
              </label>
              <Select
                value={character.class}
                onValueChange={(value) =>
                  setCharacter((prev) => ({ ...prev, class: value }))
                }
              >
                <SelectTrigger className="bg-white/5 border-gray-600 text-white">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {D5E_CLASSES.map((cls) => (
                    <SelectItem key={cls} value={cls}>
                      {cls}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Background
            </label>
            <Select
              value={character.background}
              onValueChange={(value) =>
                setCharacter((prev) => ({ ...prev, background: value }))
              }
            >
              <SelectTrigger className="bg-white/5 border-gray-600 text-white">
                <SelectValue placeholder="Select background" />
              </SelectTrigger>
              <SelectContent>
                {D5E_BACKGROUNDS.map((bg) => (
                  <SelectItem key={bg} value={bg}>
                    {bg}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Core Stats Display */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="bg-red-900/20 border-red-500/30">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Heart className="w-4 h-4 text-red-400" />
                  <span className="text-sm font-medium text-red-300">
                    Hit Points
                  </span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {character.hitPoints.current}/{character.hitPoints.maximum}
                </div>
                {character.hitPoints.temporary > 0 && (
                  <div className="text-sm text-blue-300">
                    +{character.hitPoints.temporary} temp
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-blue-900/20 border-blue-500/30">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-medium text-blue-300">
                    Armor Class
                  </span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {character.armorClass}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-purple-900/20 border-purple-500/30">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-medium text-purple-300">
                    Proficiency
                  </span>
                </div>
                <div className="text-2xl font-bold text-white">
                  +{character.proficiencyBonus}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-md font-medium text-white">Ability Scores</h4>
            <Button
              onClick={rollStats}
              variant="outline"
              size="sm"
              className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20"
            >
              <Dice6 className="w-4 h-4 mr-1" />
              Roll Stats
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {STAT_NAMES.map((stat) => (
              <Card key={stat} className="bg-white/5 border-gray-600">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-300 capitalize">
                      {stat}
                    </label>
                    <Badge
                      variant="outline"
                      className="text-white border-gray-500"
                    >
                      {getModifier(character.stats[stat])}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        updateStat(stat, character.stats[stat] - 1)
                      }
                      className="h-8 w-8 p-0 border-gray-600 text-gray-300"
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <Input
                      type="number"
                      value={character.stats[stat]}
                      onChange={(e) =>
                        updateStat(stat, parseInt(e.target.value) || 10)
                      }
                      className="bg-white/5 border-gray-600 text-white text-center"
                      min="3"
                      max="20"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        updateStat(stat, character.stats[stat] + 1)
                      }
                      className="h-8 w-8 p-0 border-gray-600 text-gray-300"
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Hit Points Management */}
          <Card className="bg-white/5 border-gray-600">
            <CardHeader>
              <CardTitle className="text-white">
                Hit Points Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Current HP
                  </label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        updateHitPoints(
                          "current",
                          character.hitPoints.current - 1
                        )
                      }
                      className="h-8 w-8 p-0 border-gray-600 text-gray-300"
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <Input
                      type="number"
                      value={character.hitPoints.current}
                      onChange={(e) =>
                        updateHitPoints(
                          "current",
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="bg-white/5 border-gray-600 text-white text-center"
                      min="0"
                      max={character.hitPoints.maximum}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        updateHitPoints(
                          "current",
                          character.hitPoints.current + 1
                        )
                      }
                      className="h-8 w-8 p-0 border-gray-600 text-gray-300"
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Temporary HP
                  </label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        updateHitPoints(
                          "temporary",
                          character.hitPoints.temporary - 1
                        )
                      }
                      className="h-8 w-8 p-0 border-gray-600 text-gray-300"
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <Input
                      type="number"
                      value={character.hitPoints.temporary}
                      onChange={(e) =>
                        updateHitPoints(
                          "temporary",
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="bg-white/5 border-gray-600 text-white text-center"
                      min="0"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        updateHitPoints(
                          "temporary",
                          character.hitPoints.temporary + 1
                        )
                      }
                      className="h-8 w-8 p-0 border-gray-600 text-gray-300"
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="equipment" className="space-y-4">
          <div className="flex items-center gap-2">
            <Input
              value={newEquipment}
              onChange={(e) => setNewEquipment(e.target.value)}
              placeholder="Add equipment..."
              className="bg-white/5 border-gray-600 text-white"
              onKeyPress={(e) => e.key === "Enter" && addEquipment()}
            />
            <Button
              onClick={addEquipment}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-2">
            {character.equipment.length === 0 ? (
              <p className="text-gray-400 text-center py-8">
                No equipment added yet
              </p>
            ) : (
              character.equipment.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-white/5 border border-gray-600 rounded p-3"
                >
                  <span className="text-white">{item.name}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeEquipment(index)}
                    className="border-red-500/50 text-red-300 hover:bg-red-500/20"
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="backstory" className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Character Backstory
            </label>
            <Textarea
              value={character.backstory}
              onChange={(e) =>
                setCharacter((prev) => ({ ...prev, backstory: e.target.value }))
              }
              placeholder="Tell your character's story..."
              className="bg-white/5 border-gray-600 text-white min-h-[200px]"
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
