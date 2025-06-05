import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  Trash2,
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

export function CharacterEdit() {
  const navigate = useNavigate();
  const { characterId } = useParams<{ characterId: string }>();
  const [activeTab, setActiveTab] = useState("basics");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [character, setCharacter] = useState<Character | null>(null);

  useEffect(() => {
    const loadCharacter = async () => {
      if (!characterId) {
        navigate("/characters");
        return;
      }

      try {
        // TODO: Replace with actual API call
        const characters: Record<string, unknown>[] = JSON.parse(
          localStorage.getItem("dnd-characters") || "[]"
        );
        const foundCharacter = characters.find(
          (c) => (c as { id: string }).id === characterId
        ) as Character | undefined;

        if (!foundCharacter) {
          alert("Character not found");
          navigate("/characters");
          return;
        }

        setCharacter(foundCharacter);
      } catch (error) {
        console.error("Failed to load character:", error);
        alert("Failed to load character");
        navigate("/characters");
      } finally {
        setLoading(false);
      }
    };

    loadCharacter();
  }, [characterId, navigate]);

  const updateCharacter = (updates: Partial<Character>) => {
    if (!character) return;

    setCharacter((prev) => {
      if (!prev) return prev;
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
          // Keep current HP ratio when max changes
          const hpRatio = prev.hitPoints.current / prev.hitPoints.maximum;
          updated.hitPoints = {
            current: Math.max(1, Math.floor(maxHP * hpRatio)),
            maximum: maxHP,
            temporary: prev.hitPoints.temporary,
          };
        }
      }

      return updated;
    });
  };

  const handleStatChange = (stat: keyof Character["stats"], value: number) => {
    if (!character) return;
    updateCharacter({
      stats: {
        ...character.stats,
        [stat]: value,
      },
    });
  };

  const handleSave = async () => {
    if (!character || !character.name || !character.race || !character.class) {
      alert("Please fill in all required fields (Name, Race, Class)");
      return;
    }

    setSaving(true);
    try {
      // TODO: Replace with actual API call
      const characters: Record<string, unknown>[] = JSON.parse(
        localStorage.getItem("dnd-characters") || "[]"
      );
      const updatedCharacters = characters.map((c) =>
        (c as { id: string }).id === characterId
          ? { ...character, updatedAt: new Date().toISOString() }
          : c
      );
      localStorage.setItem("dnd-characters", JSON.stringify(updatedCharacters));

      // Navigate back to character view
      navigate(`/characters/${characterId}`);
    } catch (error) {
      console.error("Failed to save character:", error);
      alert("Failed to save character. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!character || !characterId) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete ${character.name}? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      // TODO: Replace with actual API call
      const characters: Record<string, unknown>[] = JSON.parse(
        localStorage.getItem("dnd-characters") || "[]"
      );
      const filteredCharacters = characters.filter(
        (c) => (c as { id: string }).id !== characterId
      );
      localStorage.setItem(
        "dnd-characters",
        JSON.stringify(filteredCharacters)
      );

      navigate("/characters");
    } catch (error) {
      console.error("Failed to delete character:", error);
      alert("Failed to delete character. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading character...</div>
      </div>
    );
  }

  if (!character) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Character not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="w-full mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate(`/characters/${characterId}`)}
              className="text-gray-300 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Character
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white">Edit Character</h1>
              <p className="text-gray-300">
                Modify {character.name} - Level {character.level}{" "}
                {character.race} {character.class}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleDelete}
              variant="outline"
              className="border-red-500 text-red-400 hover:bg-red-500/20"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-green-600 hover:bg-green-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>

        {/* Character Edit Tabs */}
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
              value="combat"
              className="flex items-center gap-2 data-[state=active]:bg-purple-600"
            >
              <Sword className="w-4 h-4" />
              Combat
            </TabsTrigger>
            <TabsTrigger
              value="details"
              className="flex items-center gap-2 data-[state=active]:bg-purple-600"
            >
              <BookOpen className="w-4 h-4" />
              Details
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
                      onValueChange={(value) =>
                        updateCharacter({ class: value })
                      }
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
                <CardTitle className="text-white flex items-center gap-2">
                  <Dice6 className="w-5 h-5 text-purple-400" />
                  Ability Scores
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
              </CardContent>
            </Card>
          </TabsContent>

          {/* Combat Tab */}
          <TabsContent value="combat" className="space-y-6">
            <Card className="bg-black/20 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Sword className="w-5 h-5 text-purple-400" />
                  Combat Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Hit Points */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Current HP
                    </label>
                    <Input
                      type="number"
                      min="0"
                      max={character.hitPoints.maximum}
                      value={character.hitPoints.current}
                      onChange={(e) =>
                        updateCharacter({
                          hitPoints: {
                            ...character.hitPoints,
                            current: parseInt(e.target.value) || 0,
                          },
                        })
                      }
                      className="bg-white/5 border-gray-600 text-white"
                    />
                    <div className="text-xs text-gray-400 mt-1">
                      Max: {character.hitPoints.maximum}
                    </div>
                  </div>

                  {/* Temporary HP */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Temporary HP
                    </label>
                    <Input
                      type="number"
                      min="0"
                      value={character.hitPoints.temporary}
                      onChange={(e) =>
                        updateCharacter({
                          hitPoints: {
                            ...character.hitPoints,
                            temporary: parseInt(e.target.value) || 0,
                          },
                        })
                      }
                      className="bg-white/5 border-gray-600 text-white"
                    />
                  </div>

                  {/* Armor Class */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Armor Class
                    </label>
                    <Input
                      type="number"
                      min="1"
                      value={character.armorClass}
                      onChange={(e) =>
                        updateCharacter({
                          armorClass: parseInt(e.target.value) || 10,
                        })
                      }
                      className="bg-white/5 border-gray-600 text-white"
                    />
                    <div className="text-xs text-gray-400 mt-1">
                      Base: {10 + getStatModifier(character.stats.dexterity)}
                    </div>
                  </div>
                </div>

                {/* Combat Stats Display */}
                <div className="pt-4 border-t border-purple-500/20">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Quick Stats
                  </h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-red-400" />
                      <span className="text-gray-300">Hit Points:</span>
                      <Badge className="bg-red-900/30 text-red-300">
                        {character.hitPoints.current}/
                        {character.hitPoints.maximum}
                        {character.hitPoints.temporary > 0 &&
                          ` (+${character.hitPoints.temporary})`}
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
        </Tabs>
      </div>
    </div>
  );
}
