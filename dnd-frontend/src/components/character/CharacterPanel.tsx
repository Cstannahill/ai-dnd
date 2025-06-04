import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { Heart, Shield, Sword, User, Eye } from "lucide-react";

interface Character {
  name: string;
  class: string;
  level: number;
  race: string;
  background: string;
  hitPoints: {
    current: number;
    max: number;
    temporary: number;
  };
  armorClass: number;
  speed: number;
  proficiencyBonus: number;
  abilities: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  savingThrows: {
    [key: string]: number;
  };
  skills: {
    [key: string]: number;
  };
  equipment: {
    weapons: string[];
    armor: string[];
    items: string[];
  };
  spells?: {
    spellcastingAbility?: string;
    spellAttackBonus?: number;
    spellSaveDC?: number;
    spellSlots?: { [level: number]: { max: number; used: number } };
    knownSpells?: string[];
  };
}

interface CharacterPanelProps {
  character?: Character;
  onUpdate?: (updates: Partial<Character>) => void;
}

// Mock character data for demo
const MOCK_CHARACTER: Character = {
  name: "Eldara Moonwhisper",
  class: "Wizard",
  level: 5,
  race: "High Elf",
  background: "Sage",
  hitPoints: { current: 28, max: 32, temporary: 0 },
  armorClass: 13,
  speed: 30,
  proficiencyBonus: 3,
  abilities: {
    strength: 8,
    dexterity: 14,
    constitution: 12,
    intelligence: 16,
    wisdom: 13,
    charisma: 10,
  },
  savingThrows: {
    intelligence: 6,
    wisdom: 5,
  },
  skills: {
    arcana: 6,
    history: 6,
    investigation: 6,
    nature: 6,
  },
  equipment: {
    weapons: ["Quarterstaff", "Dagger"],
    armor: ["Studded Leather"],
    items: ["Spellbook", "Component Pouch", "Explorer's Pack"],
  },
  spells: {
    spellcastingAbility: "Intelligence",
    spellAttackBonus: 6,
    spellSaveDC: 14,
    spellSlots: {
      1: { max: 4, used: 2 },
      2: { max: 3, used: 1 },
      3: { max: 2, used: 0 },
    },
    knownSpells: ["Magic Missile", "Shield", "Misty Step", "Fireball"],
  },
};

export function CharacterPanel({
  character = MOCK_CHARACTER,
}: CharacterPanelProps) {
  const getModifier = (score: number) => {
    return Math.floor((score - 10) / 2);
  };

  return (
    <Card className="bg-white/5 border-gray-600">
      <CardHeader className="pb-2">
        <CardTitle className="text-white flex items-center gap-2">
          <User className="w-4 h-4" />
          {character.name}
        </CardTitle>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Badge variant="outline" className="text-xs">
            Level {character.level} {character.class}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {character.race}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Health */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300 flex items-center gap-1">
              <Heart className="w-3 h-3" />
              Hit Points
            </span>
            <span className="text-sm text-white">
              {character.hitPoints.current}/{character.hitPoints.max}
              {character.hitPoints.temporary > 0 &&
                ` (+${character.hitPoints.temporary})`}
            </span>
          </div>
          <Progress
            value={
              (character.hitPoints.current / character.hitPoints.max) * 100
            }
            className="h-2"
          />
        </div>

        {/* Core Stats */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-300 flex items-center gap-1">
              <Shield className="w-3 h-3" />
              AC
            </span>
            <span className="text-white">{character.armorClass}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Speed</span>
            <span className="text-white">{character.speed} ft</span>
          </div>
        </div>

        {/* Ability Scores */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-white">Abilities</h4>
          <div className="grid grid-cols-3 gap-2 text-xs">
            {Object.entries(character.abilities).map(([ability, score]) => (
              <div key={ability} className="text-center">
                <div className="text-gray-400 uppercase">
                  {ability.slice(0, 3)}
                </div>
                <div className="text-white font-medium">{score}</div>
                <div className="text-gray-500">
                  {getModifier(score) >= 0 ? "+" : ""}
                  {getModifier(score)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-white">Quick Actions</h4>
          <div className="grid grid-cols-2 gap-2">
            <Button size="sm" variant="outline" className="text-xs">
              <Sword className="w-3 h-3 mr-1" />
              Attack
            </Button>
            <Button size="sm" variant="outline" className="text-xs">
              <Eye className="w-3 h-3 mr-1" />
              Perception
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
