import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../components/ui/button";
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
  Edit,
  User,
  Shield,
  Sword,
  BookOpen,
  Heart,
  Dice6,
  Copy,
} from "lucide-react";
import type { Character } from "../services/api";

interface SavedCharacter extends Character {
  id: string;
  createdAt: Date;
  lastModified: Date;
}

const getStatModifier = (stat: number): number => {
  return Math.floor((stat - 10) / 2);
};

export function CharacterView() {
  const navigate = useNavigate();
  const { characterId } = useParams<{ characterId: string }>();
  const [loading, setLoading] = useState(true);
  const [character, setCharacter] = useState<SavedCharacter | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const loadCharacter = async () => {
      if (!characterId) {
        navigate("/characters");
        return;
      }

      try {
        // TODO: Replace with actual API call
        const characters: SavedCharacter[] = JSON.parse(
          localStorage.getItem("dnd-characters") || "[]"
        );
        const foundCharacter = characters.find(
          (c: SavedCharacter) => c.id === characterId
        );

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

  const handleCopyCharacter = async () => {
    if (!character) return;

    try {
      const newCharacter = {
        ...character,
        id: Date.now().toString(),
        name: `${character.name} (Copy)`,
        createdAt: new Date().toISOString(),
      };

      const characters = JSON.parse(
        localStorage.getItem("dnd-characters") || "[]"
      );
      characters.push(newCharacter);
      localStorage.setItem("dnd-characters", JSON.stringify(characters));

      navigate("/characters");
    } catch (error) {
      console.error("Failed to copy character:", error);
      alert("Failed to copy character. Please try again.");
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
                {character.name}
              </h1>
              <p className="text-gray-300">
                Level {character.level} {character.race} {character.class}
                {character.background && ` • ${character.background}`}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleCopyCharacter}
              variant="outline"
              className="border-gray-600 text-gray-300"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </Button>
            <Button
              onClick={() => navigate(`/characters/${characterId}/edit`)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Character
            </Button>
          </div>
        </div>

        {/* Character View Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-4 bg-black/20">
            <TabsTrigger
              value="overview"
              className="flex items-center gap-2 data-[state=active]:bg-purple-600"
            >
              <User className="w-4 h-4" />
              Overview
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

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Character Summary */}
              <Card className="bg-black/20 border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <User className="w-5 h-5 text-purple-400" />
                    Character Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-400">Race</div>
                      <div className="text-white font-medium">
                        {character.race}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Class</div>
                      <div className="text-white font-medium">
                        {character.class}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Level</div>
                      <div className="text-white font-medium">
                        {character.level}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Background</div>
                      <div className="text-white font-medium">
                        {character.background || "None"}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="bg-black/20 border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Shield className="w-5 h-5 text-purple-400" />
                    Combat Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-red-400" />
                      <div>
                        <div className="text-sm text-gray-400">Hit Points</div>
                        <div className="text-white font-medium">
                          {character.hitPoints.current}/
                          {character.hitPoints.maximum}
                          {character.hitPoints.temporary > 0 && (
                            <span className="text-blue-300 ml-1">
                              (+{character.hitPoints.temporary})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-blue-400" />
                      <div>
                        <div className="text-sm text-gray-400">Armor Class</div>
                        <div className="text-white font-medium">
                          {character.armorClass}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Sword className="w-4 h-4 text-green-400" />
                      <div>
                        <div className="text-sm text-gray-400">Prof. Bonus</div>
                        <div className="text-white font-medium">
                          +{character.proficiencyBonus}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Dice6 className="w-4 h-4 text-purple-400" />
                      <div>
                        <div className="text-sm text-gray-400">Level</div>
                        <div className="text-white font-medium">
                          {character.level}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Ability Scores Grid */}
            <Card className="bg-black/20 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Dice6 className="w-5 h-5 text-purple-400" />
                  Ability Scores
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                  {Object.entries(character.stats).map(([stat, value]) => (
                    <div
                      key={stat}
                      className="text-center p-4 bg-white/5 rounded-lg"
                    >
                      <div className="text-xs text-gray-400 uppercase mb-2">
                        {stat.slice(0, 3)}
                      </div>
                      <div className="text-2xl font-bold text-white mb-1">
                        {value}
                      </div>
                      <div className="text-sm text-purple-300">
                        {getStatModifier(value) >= 0 ? "+" : ""}
                        {getStatModifier(value)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Backstory */}
            {character.backstory && (
              <Card className="bg-black/20 border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-purple-400" />
                    Character Backstory
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {character.backstory}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats" className="space-y-6">
            <Card className="bg-black/20 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Dice6 className="w-5 h-5 text-purple-400" />
                  Detailed Ability Scores
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(character.stats).map(([stat, value]) => (
                    <div
                      key={stat}
                      className="flex items-center justify-between p-4 bg-white/5 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-lg font-semibold text-white capitalize min-w-[100px]">
                          {stat}
                        </div>
                        <div className="text-2xl font-bold text-white">
                          {value}
                        </div>
                        <Badge
                          variant="outline"
                          className="text-purple-300 border-purple-500/50"
                        >
                          {getStatModifier(value) >= 0 ? "+" : ""}
                          {getStatModifier(value)}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-400">
                          Modifier: {getStatModifier(value) >= 0 ? "+" : ""}
                          {getStatModifier(value)}
                        </div>
                        <div className="text-sm text-gray-400">
                          Save: {getStatModifier(value) >= 0 ? "+" : ""}
                          {getStatModifier(value)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Combat Tab */}
          <TabsContent value="combat" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Health */}
              <Card className="bg-black/20 border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-400" />
                    Health
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Current HP:</span>
                      <span className="text-white font-medium">
                        {character.hitPoints.current}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Maximum HP:</span>
                      <span className="text-white font-medium">
                        {character.hitPoints.maximum}
                      </span>
                    </div>
                    {character.hitPoints.temporary > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-300">Temporary HP:</span>
                        <span className="text-blue-300 font-medium">
                          {character.hitPoints.temporary}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* HP Bar */}
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div
                      className="bg-red-600 h-3 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.max(
                          0,
                          Math.min(
                            100,
                            (character.hitPoints.current /
                              character.hitPoints.maximum) *
                              100
                          )
                        )}%`,
                      }}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Defenses */}
              <Card className="bg-black/20 border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-400" />
                    Defenses
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Armor Class:</span>
                      <span className="text-white font-medium">
                        {character.armorClass}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Proficiency Bonus:</span>
                      <span className="text-white font-medium">
                        +{character.proficiencyBonus}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Saving Throws */}
            <Card className="bg-black/20 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Dice6 className="w-5 h-5 text-green-400" />
                  Saving Throws
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  {Object.entries(character.stats).map(([stat, value]) => {
                    const modifier = getStatModifier(value);
                    const isProficient =
                      character.savingThrows[stat] !== undefined;
                    const totalBonus =
                      modifier +
                      (isProficient ? character.proficiencyBonus : 0);

                    return (
                      <div
                        key={stat}
                        className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                      >
                        <span className="text-gray-300 capitalize">
                          {stat}:
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium">
                            {totalBonus >= 0 ? "+" : ""}
                            {totalBonus}
                          </span>
                          {isProficient && (
                            <Badge
                              variant="outline"
                              className="text-green-300 border-green-500/50 text-xs"
                            >
                              Prof
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-6">
            {/* Equipment */}
            <Card className="bg-black/20 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Sword className="w-5 h-5 text-purple-400" />
                  Equipment
                </CardTitle>
              </CardHeader>
              <CardContent>
                {character.equipment && character.equipment.length > 0 ? (
                  <div className="space-y-2">
                    {character.equipment.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                      >
                        <div>
                          <div className="text-white font-medium">
                            {item.name}
                          </div>
                          {item.description && (
                            <div className="text-sm text-gray-400">
                              {item.description}
                            </div>
                          )}
                        </div>
                        <Badge
                          variant="outline"
                          className="text-purple-300 border-purple-500/50"
                        >
                          {item.quantity}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    No equipment listed
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Spells */}
            {character.spells && character.spells.length > 0 && (
              <Card className="bg-black/20 border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-purple-400" />
                    Spells
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {character.spells.map((spell, index) => (
                      <div key={index} className="p-4 bg-white/5 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-white font-semibold">
                            {spell.name}
                          </h4>
                          <Badge
                            variant="outline"
                            className="text-purple-300 border-purple-500/50"
                          >
                            Level {spell.level}
                          </Badge>
                        </div>
                        <div className="grid md:grid-cols-3 gap-2 text-sm text-gray-400 mb-2">
                          <div>School: {spell.school}</div>
                          <div>Casting Time: {spell.castingTime}</div>
                          <div>Range: {spell.range}</div>
                        </div>
                        <div className="text-sm text-gray-400 mb-2">
                          Duration: {spell.duration}
                        </div>
                        <p className="text-gray-300 text-sm">
                          {spell.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Full Backstory */}
            {character.backstory && (
              <Card className="bg-black/20 border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-purple-400" />
                    Full Backstory
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-invert max-w-none">
                    <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {character.backstory}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
