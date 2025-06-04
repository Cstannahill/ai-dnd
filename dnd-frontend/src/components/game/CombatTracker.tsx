import { Badge } from "../ui/badge";

export interface InitiativeEntry {
  id: string;
  name: string;
  initiative: number;
}

export interface TurnInfo {
  currentPlayer: string;
  initiative: InitiativeEntry[];
}

interface CombatTrackerProps {
  turn: TurnInfo | undefined;
}

export function CombatTracker({ turn }: CombatTrackerProps) {
  if (!turn) {
    return (
      <div className="text-center text-sm text-muted-foreground">
        Waiting for initiative...
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {turn.initiative.map((p) => (
        <div
          key={p.id}
          className={`flex items-center justify-between p-2 rounded ${
            p.id === turn.currentPlayer
              ? "bg-red-500/20 border border-red-500/50"
              : "bg-white/5"
          }`}
        >
          <span className="text-white text-sm font-medium">{p.name}</span>
          <Badge variant="outline" className="text-xs">
            {p.initiative}
          </Badge>
        </div>
      ))}
    </div>
  );
}
