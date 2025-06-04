import { Brain, User, Settings, Dice6 } from "lucide-react";
import { Badge } from "../ui/badge";

interface GameMessage {
  id: string;
  type: "player" | "dm" | "system" | "dice";
  sender?: string;
  content: string;
  timestamp: Date;
  metadata?: {
    diceRoll?: {
      dice: string;
      result: number;
      modifier?: number;
    };
    characterAction?: boolean;
  };
}

interface ChatMessageProps {
  message: GameMessage;
  className?: string;
}

export function ChatMessage({ message, className = "" }: ChatMessageProps) {
  const getMessageIcon = () => {
    switch (message.type) {
      case "dm":
        return <Brain className="w-4 h-4 text-purple-400" />;
      case "player":
        return <User className="w-4 h-4 text-blue-400" />;
      case "system":
        return <Settings className="w-4 h-4 text-gray-400" />;
      case "dice":
        return <Dice6 className="w-4 h-4 text-green-400" />;
      default:
        return null;
    }
  };

  const getMessageBorder = () => {
    switch (message.type) {
      case "dm":
        return "border-l-4 border-purple-500/50";
      case "player":
        return "border-l-4 border-blue-500/50";
      case "system":
        return "border-l-4 border-gray-500/50";
      case "dice":
        return "border-l-4 border-green-500/50";
      default:
        return "";
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(timestamp));
  };

  const renderDiceRoll = () => {
    if (!message.metadata?.diceRoll) return null;

    const { dice, result, modifier } = message.metadata.diceRoll;
    const total = modifier ? result + modifier : result;

    return (
      <div className="mt-2 p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Dice6 className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium text-green-300">
              {dice}
              {modifier && modifier !== 0 && (
                <span className="text-gray-400">
                  {modifier > 0 ? "+" : ""}
                  {modifier}
                </span>
              )}
            </span>
          </div>
          <div className="text-lg font-bold text-green-300">{total}</div>
        </div>
        {modifier && modifier !== 0 && (
          <div className="text-xs text-gray-400 mt-1">
            Roll: {result} {modifier > 0 ? "+" : ""} {modifier} = {total}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`${getMessageBorder()} pl-4 py-2 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-1">{getMessageIcon()}</div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {message.sender && (
              <span className="text-sm font-medium text-gray-200">
                {message.sender}
              </span>
            )}
            {message.type === "dm" && (
              <Badge
                variant="outline"
                className="text-xs border-purple-500/50 text-purple-300"
              >
                DM
              </Badge>
            )}
            {message.metadata?.characterAction && (
              <Badge
                variant="outline"
                className="text-xs border-blue-500/50 text-blue-300"
              >
                Action
              </Badge>
            )}
            <span className="text-xs text-gray-500">
              {formatTimestamp(message.timestamp)}
            </span>
          </div>

          <div className="text-sm text-gray-200 leading-relaxed">
            {message.content}
          </div>

          {renderDiceRoll()}
        </div>
      </div>
    </div>
  );
}
