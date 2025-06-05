import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Plus,
  Search,
  Filter,
  Trash2,
  Edit,
  Eye,
  User,
  Crown,
  Sword,
  Heart,
  Shield,
} from "lucide-react";
import type { Character } from "../services/api";
import { getUserCharacters, deleteCharacter } from "../services/api";

interface SavedCharacter extends Character {
  id: string;
  createdAt: Date;
  lastModified: Date;
}

export function CharacterLibrary() {
  const navigate = useNavigate();
  const [characters, setCharacters] = useState<SavedCharacter[]>([]);
  const [filteredCharacters, setFilteredCharacters] = useState<
    SavedCharacter[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCharacters();
  }, []);

  useEffect(() => {
    filterCharacters();
  }, [characters, searchTerm, classFilter, levelFilter]);

  const loadCharacters = async () => {
    try {
      setLoading(true);
      // For demo purposes, using mock user ID
      const userCharacters = await getUserCharacters("demo-user");
      setCharacters(userCharacters as SavedCharacter[]);
    } catch (error) {
      console.error("Failed to load characters:", error);
      // Mock data for demo
      setCharacters([
        {
          id: "1",
          name: "Eldara Moonwhisper",
          race: "High Elf",
          class: "Wizard",
          level: 5,
          background: "Sage",
          stats: {
            strength: 8,
            dexterity: 14,
            constitution: 12,
            intelligence: 16,
            wisdom: 13,
            charisma: 10,
          },
          hitPoints: { current: 28, maximum: 32, temporary: 0 },
          armorClass: 13,
          proficiencyBonus: 3,
          savingThrows: {},
          skills: {},
          equipment: [
            { name: "Quarterstaff", quantity: 1 },
            { name: "Spellbook", quantity: 1 },
            { name: "Component Pouch", quantity: 1 },
          ],
          backstory: "A young elf scholar seeking ancient magical knowledge...",
          createdAt: new Date("2024-12-01"),
          lastModified: new Date("2024-12-15"),
        },
        {
          id: "2",
          name: "Thorin Ironforge",
          race: "Mountain Dwarf",
          class: "Fighter",
          level: 3,
          background: "Soldier",
          stats: {
            strength: 16,
            dexterity: 12,
            constitution: 15,
            intelligence: 10,
            wisdom: 13,
            charisma: 8,
          },
          hitPoints: { current: 32, maximum: 32, temporary: 0 },
          armorClass: 18,
          proficiencyBonus: 2,
          savingThrows: {},
          skills: {},
          equipment: [
            { name: "Warhammer", quantity: 1 },
            { name: "Chain Mail", quantity: 1 },
            { name: "Shield", quantity: 1 },
          ],
          backstory: "A veteran warrior seeking redemption for past battles...",
          createdAt: new Date("2024-11-20"),
          lastModified: new Date("2024-12-10"),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filterCharacters = () => {
    let filtered = characters;

    if (searchTerm) {
      filtered = filtered.filter(
        (char) =>
          char.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          char.race.toLowerCase().includes(searchTerm.toLowerCase()) ||
          char.class.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (classFilter !== "all") {
      filtered = filtered.filter((char) => char.class === classFilter);
    }

    if (levelFilter !== "all") {
      const [min, max] = levelFilter.split("-").map(Number);
      filtered = filtered.filter((char) => {
        if (max) {
          return char.level >= min && char.level <= max;
        }
        return char.level >= min;
      });
    }

    setFilteredCharacters(filtered);
  };

  const handleDeleteCharacter = async (characterId: string) => {
    if (window.confirm("Are you sure you want to delete this character?")) {
      try {
        await deleteCharacter("demo-user", characterId);
        setCharacters(characters.filter((char) => char.id !== characterId));
      } catch (error) {
        console.error("Failed to delete character:", error);
        // For demo, just remove from local state
        setCharacters(characters.filter((char) => char.id !== characterId));
      }
    }
  };

  const getClassColor = (characterClass: string) => {
    const colors: Record<string, string> = {
      Barbarian: "bg-red-900/30 text-red-300 border-red-500/50",
      Bard: "bg-pink-900/30 text-pink-300 border-pink-500/50",
      Cleric: "bg-yellow-900/30 text-yellow-300 border-yellow-500/50",
      Druid: "bg-green-900/30 text-green-300 border-green-500/50",
      Fighter: "bg-orange-900/30 text-orange-300 border-orange-500/50",
      Monk: "bg-blue-900/30 text-blue-300 border-blue-500/50",
      Paladin: "bg-purple-900/30 text-purple-300 border-purple-500/50",
      Ranger: "bg-emerald-900/30 text-emerald-300 border-emerald-500/50",
      Rogue: "bg-gray-900/30 text-gray-300 border-gray-500/50",
      Sorcerer: "bg-red-900/30 text-red-300 border-red-500/50",
      Warlock: "bg-violet-900/30 text-violet-300 border-violet-500/50",
      Wizard: "bg-indigo-900/30 text-indigo-300 border-indigo-500/50",
    };
    return (
      colors[characterClass] ||
      "bg-gray-900/30 text-gray-300 border-gray-500/50"
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading characters...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="border-b border-purple-500/20 bg-black/20 backdrop-blur">
        <div className="w-full mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <User className="w-8 h-8" />
                Character Library
              </h1>
              <p className="text-gray-300 mt-1">Manage your D&D characters</p>
            </div>
            <Button
              onClick={() => navigate("/characters/create")}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Character
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="w-full mx-auto px-4 py-6">
        <Card className="bg-white/10 backdrop-blur border-purple-500/20 mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search characters..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/5 border-gray-600 text-white"
                  />
                </div>
              </div>

              <div className="flex gap-2 items-center">
                <Filter className="w-4 h-4 text-gray-400" />
                <Select value={classFilter} onValueChange={setClassFilter}>
                  <SelectTrigger className="w-40 bg-white/5 border-gray-600 text-white">
                    <SelectValue placeholder="All Classes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    <SelectItem value="Barbarian">Barbarian</SelectItem>
                    <SelectItem value="Bard">Bard</SelectItem>
                    <SelectItem value="Cleric">Cleric</SelectItem>
                    <SelectItem value="Druid">Druid</SelectItem>
                    <SelectItem value="Fighter">Fighter</SelectItem>
                    <SelectItem value="Monk">Monk</SelectItem>
                    <SelectItem value="Paladin">Paladin</SelectItem>
                    <SelectItem value="Ranger">Ranger</SelectItem>
                    <SelectItem value="Rogue">Rogue</SelectItem>
                    <SelectItem value="Sorcerer">Sorcerer</SelectItem>
                    <SelectItem value="Warlock">Warlock</SelectItem>
                    <SelectItem value="Wizard">Wizard</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={levelFilter} onValueChange={setLevelFilter}>
                  <SelectTrigger className="w-32 bg-white/5 border-gray-600 text-white">
                    <SelectValue placeholder="All Levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="1-5">1-5</SelectItem>
                    <SelectItem value="6-10">6-10</SelectItem>
                    <SelectItem value="11-15">11-15</SelectItem>
                    <SelectItem value="16-20">16-20</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Character Grid */}
        {filteredCharacters.length === 0 ? (
          <Card className="bg-white/10 backdrop-blur border-purple-500/20">
            <CardContent className="p-12 text-center">
              <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                No characters found
              </h3>
              <p className="text-gray-300 mb-6">
                {characters.length === 0
                  ? "Create your first D&D character to get started"
                  : "Try adjusting your search or filters"}
              </p>
              <Button
                onClick={() => navigate("/character/create")}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Character
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCharacters.map((character) => (
              <Card
                key={character.id}
                className="bg-white/10 backdrop-blur border-purple-500/20 hover:border-purple-400/40 transition-colors"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-white text-lg">
                        {character.name}
                      </CardTitle>
                      <div className="flex gap-2 mt-2">
                        <Badge
                          variant="outline"
                          className={getClassColor(character.class)}
                        >
                          <Crown className="w-3 h-3 mr-1" />
                          Level {character.level} {character.class}
                        </Badge>
                      </div>
                      <div className="flex gap-2 mt-1">
                        <Badge
                          variant="outline"
                          className="bg-gray-900/30 text-gray-300 border-gray-500/50"
                        >
                          {character.race}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="bg-amber-900/30 text-amber-300 border-amber-500/50"
                        >
                          {character.background}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="text-center p-2 bg-red-900/20 rounded border border-red-500/30">
                      <Heart className="w-4 h-4 text-red-400 mx-auto mb-1" />
                      <div className="text-xs text-red-300">HP</div>
                      <div className="text-sm font-bold text-white">
                        {character.hitPoints.current}/
                        {character.hitPoints.maximum}
                      </div>
                    </div>
                    <div className="text-center p-2 bg-blue-900/20 rounded border border-blue-500/30">
                      <Shield className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                      <div className="text-xs text-blue-300">AC</div>
                      <div className="text-sm font-bold text-white">
                        {character.armorClass}
                      </div>
                    </div>
                    <div className="text-center p-2 bg-purple-900/20 rounded border border-purple-500/30">
                      <Sword className="w-4 h-4 text-purple-400 mx-auto mb-1" />
                      <div className="text-xs text-purple-300">Prof</div>
                      <div className="text-sm font-bold text-white">
                        +{character.proficiencyBonus}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        navigate(`/characters/view/${character.id}`)
                      }
                      className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        navigate(`/characters/edit/${character.id}`)
                      }
                      className="flex-1 border-blue-600 text-blue-300 hover:bg-blue-700"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteCharacter(character.id)}
                      className="border-red-600 text-red-300 hover:bg-red-700"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>

                  {/* Last Modified */}
                  <div className="text-xs text-gray-400 mt-2 text-center">
                    Modified {character.lastModified.toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
