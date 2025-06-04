import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import {
  ArrowLeft,
  Save,
  Dice6,
  User,
  Shield,
  Sword,
  BookOpen,
  Heart,
} from "lucide-react";
import type { Character } from "../services/api";

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

// Base stats by class for quick start
const CLASS_BASE_STATS: Record<string, Partial<Character["stats"]>> = {
  Barbarian: { strength: 15, constitution: 14, dexterity: 13 },
  Fighter: { strength: 15, constitution: 14, dexterity: 13 },
  Paladin: { strength: 15, charisma: 14, constitution: 13 },
  Ranger: { dexterity: 15, wisdom: 14, constitution: 13 },
  Rogue: { dexterity: 15, intelligence: 14, charisma: 13 },
  Monk: { dexterity: 15, wisdom: 14, constitution: 13 },
  Bard: { charisma: 15, dexterity: 14, intelligence: 13 },
  Cleric: { wisdom: 15, constitution: 14, strength: 13 },
  Druid: { wisdom: 15, constitution: 14, dexterity: 13 },
  Sorcerer: { charisma: 15, constitution: 14, dexterity: 13 },
  Warlock: { charisma: 15, constitution: 14, dexterity: 13 },
  Wizard: { intelligence: 15, constitution: 14, dexterity: 13 },
};

const getStatModifier = (stat: number): number => {
  return Math.floor((stat - 10) / 2);
};

const calculateProficiencyBonus = (level: number): number => {
  return Math.ceil(level / 4) + 1;
};

const calculateArmorClass = (dexterity: number): number => {
  return 10 + getStatModifier(dexterity);
};

const calculateHitPoints = (
  level: number,
  constitution: number,
  characterClass: string
): number => {
  const hitDice: Record<string, number> = {
    Barbarian: 12,
    Fighter: 10,
    Paladin: 10,
    Ranger: 10,
    Monk: 8,
    Bard: 8,
    Cleric: 8,
    Druid: 8,
    Rogue: 8,
    Sorcerer: 6,
    Warlock: 8,
    Wizard: 6,
  };

  const hitDie = hitDice[characterClass] || 8;
  const conModifier = getStatModifier(constitution);
  return (
    hitDie +
    conModifier +
    (level - 1) * (Math.floor(hitDie / 2) + 1 + conModifier)
  );
};

export function CharacterCreate() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("basics");
  const [saving, setSaving] = useState(false);

  const [character, setCharacter] = useState<Character>({
    name: "",
    race: "",
    class: "",
    level: 1,
    background: "",
    backstory: "",
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
    spells: [],
  });

  const updateCharacter = (updates: Partial<Character>) => {
    setCharacter((prev) => {
      const updated = { ...prev, ...updates };

      // Recalculate derived stats
      if (updates.stats || updates.level || updates.class) {
        const constitution =
          updates.stats?.constitution ?? prev.stats.constitution;
        const dexterity = updates.stats?.dexterity ?? prev.stats.dexterity;
        const level = updates.level ?? prev.level;
        const characterClass = updates.class ?? prev.class;

        updated.proficiencyBonus = calculateProficiencyBonus(level);
        updated.armorClass = calculateArmorClass(dexterity);

        if (characterClass) {
          const maxHP = calculateHitPoints(level, constitution, characterClass);
          updated.hitPoints = {
            current: maxHP,
            maximum: maxHP,
            temporary: 0,
          };
        }
      }

      return updated;
    });
  };

  const handleStatChange = (stat: keyof Character["stats"], value: number) => {
    updateCharacter({
      stats: {
        ...character.stats,
        [stat]: value,
      },
    });
  };

  const handleClassChange = (newClass: string) => {
    const baseStats = CLASS_BASE_STATS[newClass];
    if (baseStats) {
      updateCharacter({
        class: newClass,
        stats: {
          ...character.stats,
          ...baseStats,
        },
      });
    } else {
      updateCharacter({ class: newClass });
    }
  };

  const rollStats = () => {
    const rollStat = () => {
      const rolls = Array.from(
        { length: 4 },
        () => Math.floor(Math.random() * 6) + 1
      );
      rolls.sort((a, b) => b - a);
      return rolls.slice(0, 3).reduce((sum, roll) => sum + roll, 0);
    };

    const newStats = {
      strength: rollStat(),
      dexterity: rollStat(),
      constitution: rollStat(),
      intelligence: rollStat(),
      wisdom: rollStat(),
      charisma: rollStat(),
    };

    updateCharacter({ stats: newStats });
  };

  const handleSave = async () => {
    if (!character.name || !character.race || !character.class) {
      alert("Please fill in all required fields (Name, Race, Class)");
      return;
    }

    setSaving(true);
    try {
      // TODO: Replace with actual API call
      const savedCharacter = {
        ...character,
        id: Date.now().toString(), // Mock ID
        createdAt: new Date().toISOString(),
      };

      // Mock save to localStorage for now
      const existingCharacters = JSON.parse(
        localStorage.getItem("dnd-characters") || "[]"
      );
      existingCharacters.push(savedCharacter);
      localStorage.setItem(
        "dnd-characters",
        JSON.stringify(existingCharacters)
      );

      // Navigate to character library
      navigate("/characters");
    } catch (error) {
      console.error("Failed to save character:", error);
      alert("Failed to save character. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const canAdvanceToNext = () => {
    switch (activeTab) {
      case "basics":
        return character.name && character.race && character.class;
      case "stats":
        return true;
      case "details":
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/characters")}
              className="text-gray-300 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Library
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white">
                Create Character
              </h1>
              <p className="text-gray-300">
                Build your D&D 5E character step by step
              </p>
            </div>
          </div>
          <Button
            onClick={handleSave}
            disabled={!canAdvanceToNext() || saving}
            className="bg-green-600 hover:bg-green-700"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : "Save Character"}
          </Button>
        </div>

        {/* Character Creation Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-4 bg-black/20">
            <TabsTrigger
              value="basics"
              className="flex items-center gap-2 data-[state=active]:bg-purple-600"
            >
              <User className="w-4 h-4" />
              Basics
            </TabsTrigger>
            <TabsTrigger
              value="stats"
              className="flex items-center gap-2 data-[state=active]:bg-purple-600"
            >
              <Dice6 className="w-4 h-4" />
              Stats
            </TabsTrigger>
            <TabsTrigger
              value="details"
              className="flex items-center gap-2 data-[state=active]:bg-purple-600"
            >
              <BookOpen className="w-4 h-4" />
              Details
            </TabsTrigger>
            <TabsTrigger
              value="review"
              className="flex items-center gap-2 data-[state=active]:bg-purple-600"
            >
              <Shield className="w-4 h-4" />
              Review
            </TabsTrigger>
          </TabsList>

          {/* Basics Tab */}
          <TabsContent value="basics" className="space-y-6">
            <Card className="bg-black/20 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-purple-400" />
                  Character Basics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Character Name *
                    </label>
                    <Input
                      value={character.name}
                      onChange={(e) =>
                        updateCharacter({ name: e.target.value })
                      }
                      placeholder="Enter character name..."
                      className="bg-white/5 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Level
                    </label>
                    <Select
                      value={character.level.toString()}
                      onValueChange={(value) =>
                        updateCharacter({ level: parseInt(value) })
                      }
                    >
                      <SelectTrigger className="bg-white/5 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 20 }, (_, i) => i + 1).map(
                          (level) => (
                            <SelectItem key={level} value={level.toString()}>
                              Level {level}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Race *
                    </label>
                    <Select
                      value={character.race}
                      onValueChange={(value) =>
                        updateCharacter({ race: value })
                      }
                    >
                      <SelectTrigger className="bg-white/5 border-gray-600 text-white">
                        <SelectValue placeholder="Choose race..." />
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
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Class *
                    </label>
                    <Select
                      value={character.class}
                      onValueChange={handleClassChange}
                    >
                      <SelectTrigger className="bg-white/5 border-gray-600 text-white">
                        <SelectValue placeholder="Choose class..." />
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
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Background
                    </label>
                    <Select
                      value={character.background}
                      onValueChange={(value) =>
                        updateCharacter({ background: value })
                      }
                    >
                      <SelectTrigger className="bg-white/5 border-gray-600 text-white">
                        <SelectValue placeholder="Choose background..." />
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
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats" className="space-y-6">
            <Card className="bg-black/20 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Dice6 className="w-5 h-5 text-purple-400" />
                    Ability Scores
                  </div>
                  <Button onClick={rollStats} variant="outline" size="sm">
                    <Dice6 className="w-4 h-4 mr-2" />
                    Roll Stats
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  {Object.entries(character.stats).map(([stat, value]) => (
                    <div key={stat} className="space-y-2">
                      <label className="block text-sm font-medium text-gray-300 capitalize">
                        {stat}
                      </label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="3"
                          max="20"
                          value={value}
                          onChange={(e) =>
                            handleStatChange(
                              stat as keyof Character["stats"],
                              parseInt(e.target.value) || 10
                            )
                          }
                          className="bg-white/5 border-gray-600 text-white text-center"
                        />
                        <Badge
                          variant="outline"
                          className="text-purple-300 border-purple-500/50 min-w-[3rem]"
                        >
                          {getStatModifier(value) >= 0 ? "+" : ""}
                          {getStatModifier(value)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Derived Stats Preview */}
                <div className="mt-6 pt-6 border-t border-purple-500/20">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Derived Stats
                  </h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-red-400" />
                      <span className="text-gray-300">Hit Points:</span>
                      <Badge className="bg-red-900/30 text-red-300">
                        {character.hitPoints.maximum}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-blue-400" />
                      <span className="text-gray-300">Armor Class:</span>
                      <Badge className="bg-blue-900/30 text-blue-300">
                        {character.armorClass}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Sword className="w-4 h-4 text-green-400" />
                      <span className="text-gray-300">Prof. Bonus:</span>
                      <Badge className="bg-green-900/30 text-green-300">
                        +{character.proficiencyBonus}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-6">
            <Card className="bg-black/20 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-purple-400" />
                  Character Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Backstory
                  </label>
                  <Textarea
                    value={character.backstory || ""}
                    onChange={(e) =>
                      updateCharacter({ backstory: e.target.value })
                    }
                    placeholder="Write your character's backstory..."
                    className="bg-white/5 border-gray-600 text-white h-32"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Review Tab */}
          <TabsContent value="review" className="space-y-6">
            <Card className="bg-black/20 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="w-5 h-5 text-purple-400" />
                  Character Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Basic Info
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Name:</span>
                        <span className="text-white">
                          {character.name || "Unnamed"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Race:</span>
                        <span className="text-white">
                          {character.race || "Unknown"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Class:</span>
                        <span className="text-white">
                          {character.class || "Unknown"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Level:</span>
                        <span className="text-white">{character.level}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Background:</span>
                        <span className="text-white">
                          {character.background || "None"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Combat Stats
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Hit Points:</span>
                        <span className="text-white">
                          {character.hitPoints.maximum}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Armor Class:</span>
                        <span className="text-white">
                          {character.armorClass}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">
                          Proficiency Bonus:
                        </span>
                        <span className="text-white">
                          +{character.proficiencyBonus}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Ability Scores
                  </h3>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                    {Object.entries(character.stats).map(([stat, value]) => (
                      <div key={stat} className="text-center">
                        <div className="text-xs text-gray-400 uppercase mb-1">
                          {stat.slice(0, 3)}
                        </div>
                        <div className="text-xl font-bold text-white">
                          {value}
                        </div>
                        <div className="text-sm text-purple-300">
                          {getStatModifier(value) >= 0 ? "+" : ""}
                          {getStatModifier(value)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={() => {
              const tabs = ["basics", "stats", "details", "review"];
              const currentIndex = tabs.indexOf(activeTab);
              if (currentIndex > 0) {
                setActiveTab(tabs[currentIndex - 1]);
              }
            }}
            disabled={activeTab === "basics"}
            className="border-gray-600 text-gray-300"
          >
            Previous
          </Button>
          <Button
            onClick={() => {
              const tabs = ["basics", "stats", "details", "review"];
              const currentIndex = tabs.indexOf(activeTab);
              if (currentIndex < tabs.length - 1) {
                setActiveTab(tabs[currentIndex + 1]);
              } else {
                handleSave();
              }
            }}
            disabled={!canAdvanceToNext()}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {activeTab === "review" ? "Save Character" : "Next"}
          </Button>
        </div>
      </div>
    </div>
  );
}
