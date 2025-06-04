import { useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

export interface PersonalityOption {
  id: string;
  name: string;
  description: string;
}

interface AIPersonalitySelectorProps {
  value: string;
  onChange: (value: string) => void;
  personalities?: PersonalityOption[];
  disabled?: boolean;
}

const DEFAULT_PERSONALITIES: PersonalityOption[] = [
  {
    id: "classic",
    name: "Classic Fantasy DM",
    description: "Traditional high fantasy narration",
  },
  {
    id: "tolkien",
    name: "Tolkien DM",
    description: "Epic prose inspired by Middle-earth",
  },
  {
    id: "grimdark",
    name: "Grimdark",
    description: "Gritty and perilous adventures",
  },
];

export function AIPersonalitySelector({
  value,
  onChange,
  personalities = DEFAULT_PERSONALITIES,
  disabled,
}: AIPersonalitySelectorProps) {
  useEffect(() => {
    if (!value && personalities.length) {
      onChange(personalities[0].id);
    }
  }, [value, personalities, onChange]);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-muted-foreground mb-1">
        AI Personality
      </label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className="bg-card border border-border text-primary">
          <SelectValue placeholder="Select personality" />
        </SelectTrigger>
        <SelectContent>
          {personalities.map((p) => (
            <SelectItem key={p.id} value={p.id}>
              {p.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {value && (
        <p className="text-xs text-muted-foreground">
          {personalities.find((p) => p.id === value)?.description}
        </p>
      )}
    </div>
  );
}
