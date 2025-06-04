const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://your-backend-url.com/api"
    : "http://localhost:3001/api";

// Character-related types
export interface Character {
  name: string;
  race: string;
  class: string;
  level: number;
  stats: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  hitPoints: {
    current: number;
    maximum: number;
    temporary: number;
  };
  armorClass: number;
  proficiencyBonus: number;
  savingThrows: Record<string, number>;
  skills: Record<string, number>;
  equipment: Array<{
    name: string;
    quantity: number;
    description?: string;
  }>;
  spells?: Array<{
    name: string;
    level: number;
    school: string;
    description: string;
    castingTime: string;
    range: string;
    duration: string;
  }>;
  background: string;
  backstory?: string;
}

interface CreateRoomResponse {
  code: string;
  name: string;
  id: string;
}

interface Room {
  code: string;
  name: string;
  host: string;
  players: Array<{
    id: string;
    name: string;
    character?: Character;
  }>;
  aiModel: string;
  status: string;
}

class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      errorData.message || `Request failed with status ${response.status}`,
      response.status,
      errorData.code
    );
  }

  return response.json();
}

export async function createRoom(
  name: string,
  aiModel: string = "gpt-4"
): Promise<CreateRoomResponse> {
  return apiRequest<CreateRoomResponse>("/rooms", {
    method: "POST",
    body: JSON.stringify({ name, aiModel }),
  });
}

export async function joinRoom(code: string): Promise<Room> {
  return apiRequest<Room>(`/rooms/${code}/join`, {
    method: "POST",
  });
}

export async function getRoomInfo(code: string): Promise<Room> {
  return apiRequest<Room>(`/rooms/${code}`);
}

export async function updateRoomSettings(
  code: string,
  settings: Partial<{ aiModel: string; difficulty: string; style: string }>
): Promise<Room> {
  return apiRequest<Room>(`/rooms/${code}/settings`, {
    method: "PATCH",
    body: JSON.stringify(settings),
  });
}

// Character-related API calls
export async function saveCharacter(
  roomCode: string,
  playerId: string,
  character: Character
): Promise<Character> {
  return apiRequest<Character>(
    `/rooms/${roomCode}/players/${playerId}/character`,
    {
      method: "PUT",
      body: JSON.stringify(character),
    }
  );
}

export async function getCharacter(
  roomCode: string,
  playerId: string
): Promise<Character | null> {
  try {
    return await apiRequest<Character>(
      `/rooms/${roomCode}/players/${playerId}/character`
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
}

// AI DM Fine-tuning API
export interface FineTuningRequest {
  campaignStyle: string;
  worldDescription: string;
  keyNPCs: Array<{
    name: string;
    description: string;
    personality: string;
  }>;
  campaignThemes: string[];
  customPrompts: string[];
}

export async function createFineTunedDM(
  request: FineTuningRequest
): Promise<{ id: string; name: string; description: string }> {
  return apiRequest("/ai/fine-tune", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export async function getAvailableModels(): Promise<
  Array<{
    id: string;
    name: string;
    description: string;
    provider: "openai" | "anthropic" | "ollama";
    capabilities: string[];
  }>
> {
  return apiRequest("/ai/models");
}

// Dice rolling utility (can be done client-side but useful for validation)
export interface DiceRollResult {
  dice: string;
  results: number[];
  total: number;
  modifier: number;
  finalTotal: number;
}

export function rollDice(
  diceNotation: string,
  modifier: number = 0
): DiceRollResult {
  // Parse dice notation like "1d20", "2d6", "4d4+2"
  const match = diceNotation.match(/(\d+)d(\d+)(?:([+-])(\d+))?/i);

  if (!match) {
    throw new Error("Invalid dice notation");
  }

  const [, countStr, sidesStr, modifierSign, modifierStr] = match;
  const count = parseInt(countStr);
  const sides = parseInt(sidesStr);
  let rollModifier = modifier;

  if (modifierSign && modifierStr) {
    const mod = parseInt(modifierStr);
    rollModifier += modifierSign === "+" ? mod : -mod;
  }

  const results: number[] = [];
  for (let i = 0; i < count; i++) {
    results.push(Math.floor(Math.random() * sides) + 1);
  }

  const total = results.reduce((sum, roll) => sum + roll, 0);
  const finalTotal = total + rollModifier;

  return {
    dice: diceNotation,
    results,
    total,
    modifier: rollModifier,
    finalTotal,
  };
}

export { ApiError };

export interface Player {
  id: string;
  name: string;
  character?: {
    name: string;
    class: string;
    level: number;
    ready: boolean;
    stats?: {
      [key: string]: number;
    };
  };
}

export interface GameMessage {
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

// Player Management
export async function joinAsPlayer(
  roomCode: string,
  playerName: string
): Promise<Player> {
  return apiRequest<Player>(`/rooms/${roomCode}/players`, {
    method: "POST",
    body: JSON.stringify({ name: playerName }),
  });
}

export async function updateCharacter(
  roomCode: string,
  playerId: string,
  character: Player["character"]
): Promise<Player> {
  return apiRequest<Player>(
    `/rooms/${roomCode}/players/${playerId}/character`,
    {
      method: "PUT",
      body: JSON.stringify(character),
    }
  );
}

// Game Actions
export async function sendPlayerAction(
  roomCode: string,
  playerId: string,
  action: string
): Promise<void> {
  return apiRequest(`/rooms/${roomCode}/actions`, {
    method: "POST",
    body: JSON.stringify({ playerId, action }),
  });
}

export async function updateAIModel(
  roomCode: string,
  model: string
): Promise<Room> {
  return apiRequest<Room>(`/rooms/${roomCode}/ai-model`, {
    method: "PUT",
    body: JSON.stringify({ model }),
  });
}

// Fine-tuning
export interface AIPersonality {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  traits: string[];
}

export async function getAIPersonalities(): Promise<AIPersonality[]> {
  return apiRequest<AIPersonality[]>("/ai/personalities");
}

export async function createCustomPersonality(
  personality: Omit<AIPersonality, "id">
): Promise<AIPersonality> {
  return apiRequest<AIPersonality>("/ai/personalities", {
    method: "POST",
    body: JSON.stringify(personality),
  });
}

// Game State
export interface GameState {
  roomCode: string;
  phase: "exploration" | "combat" | "social";
  turn?: {
    currentPlayer: string;
    initiative: Array<{ id: string; name: string; initiative: number }>;
  };
  environment?: {
    location: string;
    description: string;
    lighting: string;
  };
}

export async function getGameState(roomCode: string): Promise<GameState> {
  return apiRequest<GameState>(`/rooms/${roomCode}/state`);
}

export async function updateGameState(
  roomCode: string,
  state: Partial<GameState>
): Promise<GameState> {
  return apiRequest<GameState>(`/rooms/${roomCode}/state`, {
    method: "PATCH",
    body: JSON.stringify(state),
  });
}

// User Character Management API calls
export async function getUserCharacters(userId: string): Promise<Character[]> {
  return apiRequest<Character[]>(`/users/${userId}/characters`);
}

export async function createCharacter(
  userId: string,
  character: Omit<Character, "id" | "createdAt" | "lastModified">
): Promise<Character> {
  return apiRequest<Character>(`/users/${userId}/characters`, {
    method: "POST",
    body: JSON.stringify(character),
  });
}

export async function updateCharacterById(
  userId: string,
  characterId: string,
  character: Partial<Character>
): Promise<Character> {
  return apiRequest<Character>(`/users/${userId}/characters/${characterId}`, {
    method: "PUT",
    body: JSON.stringify(character),
  });
}

export async function getCharacterById(
  userId: string,
  characterId: string
): Promise<Character | null> {
  try {
    return await apiRequest<Character>(
      `/users/${userId}/characters/${characterId}`
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function deleteCharacter(
  userId: string,
  characterId: string
): Promise<void> {
  return apiRequest<void>(`/users/${userId}/characters/${characterId}`, {
    method: "DELETE",
  });
}

export async function duplicateCharacter(
  userId: string,
  characterId: string,
  newName?: string
): Promise<Character> {
  return apiRequest<Character>(
    `/users/${userId}/characters/${characterId}/duplicate`,
    {
      method: "POST",
      body: JSON.stringify({ newName }),
    }
  );
}
