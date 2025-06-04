import { Badge } from "../ui/badge";

export interface Player {
  id: string;
  name: string;
  character?: {
    name: string;
    class: string;
    level: number;
    ready: boolean;
  };
  isHost?: boolean;
}

interface PlayerListProps {
  players: Player[];
}

export function PlayerList({ players }: PlayerListProps) {
  if (!players.length) {
    return (
      <div className="text-center text-gray-400 py-8">
        No players yet
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {players.map((player) => (
        <div
          key={player.id}
          className="flex items-center justify-between p-3 rounded-lg bg-white/5"
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-white">{player.name}</span>
              {player.isHost && (
                <Badge variant="outline" className="text-xs">
                  Host
                </Badge>
              )}
            </div>
            {player.character && (
              <div className="text-sm text-gray-400">
                {player.character.name} • Level {player.character.level}{" "}
                {player.character.class}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {player.character?.ready ? (
              <Badge className="bg-green-900/30 text-green-300">Ready</Badge>
            ) : (
              <Badge
                variant="secondary"
                className="bg-yellow-900/30 text-yellow-300"
              >
                Setup
              </Badge>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
