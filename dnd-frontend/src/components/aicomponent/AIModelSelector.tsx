import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Badge } from "../ui/badge";
import { Brain, Zap, Crown, Sparkles } from "lucide-react";

interface AIModelSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}

const AI_MODELS = [
  {
    id: "gpt-4",
    name: "GPT-4",
    description: "Advanced reasoning and creativity",
    tier: "premium",
    icon: Crown,
    color: "text-yellow-400",
    badgeColor: "bg-yellow-900/30 text-yellow-300",
  },
  {
    id: "gpt-4-turbo",
    name: "GPT-4 Turbo",
    description: "Faster responses with great quality",
    tier: "premium",
    icon: Zap,
    color: "text-blue-400",
    badgeColor: "bg-blue-900/30 text-blue-300",
  },
  {
    id: "gpt-3.5-turbo",
    name: "GPT-3.5 Turbo",
    description: "Fast and reliable for most games",
    tier: "standard",
    icon: Brain,
    color: "text-green-400",
    badgeColor: "bg-green-900/30 text-green-300",
  },
  {
    id: "claude-3-haiku",
    name: "Claude 3 Haiku",
    description: "Quick responses and good roleplay",
    tier: "standard",
    icon: Sparkles,
    color: "text-purple-400",
    badgeColor: "bg-purple-900/30 text-purple-300",
  },
  {
    id: "claude-3-sonnet",
    name: "Claude 3 Sonnet",
    description: "Balanced performance and creativity",
    tier: "premium",
    icon: Sparkles,
    color: "text-purple-400",
    badgeColor: "bg-purple-900/30 text-purple-300",
  },
  {
    id: "claude-3-opus",
    name: "Claude 3 Opus",
    description: "Top-tier storytelling and reasoning",
    tier: "premium",
    icon: Crown,
    color: "text-purple-400",
    badgeColor: "bg-purple-900/30 text-purple-300",
  },
];

export function AIModelSelector({
  value,
  onValueChange,
  disabled = false,
}: AIModelSelectorProps) {
  const selectedModel = AI_MODELS.find((model) => model.id === value);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-300">
          AI Dungeon Master Model
        </label>
        {selectedModel && (
          <Badge className={selectedModel.badgeColor}>
            {selectedModel.tier === "premium" ? "Premium" : "Standard"}
          </Badge>
        )}
      </div>

      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger className="bg-white/5 border-gray-600 text-white">
          <SelectValue placeholder="Select AI model...">
            {selectedModel && (
              <div className="flex items-center gap-2">
                <selectedModel.icon
                  className={`w-4 h-4 ${selectedModel.color}`}
                />
                <span>{selectedModel.name}</span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-gray-800 border-gray-600">
          {AI_MODELS.map((model) => {
            const IconComponent = model.icon;
            return (
              <SelectItem
                key={model.id}
                value={model.id}
                className="text-white hover:bg-gray-700 focus:bg-gray-700"
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <IconComponent className={`w-4 h-4 ${model.color}`} />
                    <div>
                      <div className="font-medium">{model.name}</div>
                      <div className="text-xs text-gray-400">
                        {model.description}
                      </div>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={`ml-2 text-xs ${model.badgeColor} border-current`}
                  >
                    {model.tier === "premium" ? "Premium" : "Standard"}
                  </Badge>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>

      {selectedModel && (
        <div className="text-xs text-gray-400 mt-2">
          {selectedModel.description}
        </div>
      )}

      {disabled && (
        <p className="text-xs text-gray-500">
          Only the host can change the AI model
        </p>
      )}
    </div>
  );
}
