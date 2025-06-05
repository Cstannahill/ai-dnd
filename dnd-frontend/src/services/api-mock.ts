// Mock API service for testing navigation without backend
const MOCK_ROOMS = new Map<string, Record<string, unknown>>();

// Generate a random room code
function generateRoomCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export async function createRoom(name: string, aiModel: string = "gpt-4") {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const roomCode = generateRoomCode();
  const room = {
    code: roomCode,
    name,
    id: `room_${roomCode}`,
    host: "mock_host_id",
    players: [],
    aiModel,
    status: "waiting",
  };

  MOCK_ROOMS.set(roomCode, room);

  return {
    code: roomCode,
    name,
    id: room.id,
  };
}

export async function joinRoom(code: string) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const room = MOCK_ROOMS.get(code);
  if (!room) {
    throw new Error(`Room ${code} not found`);
  }

  return room;
}

export async function getRoomInfo(code: string) {
  const room = MOCK_ROOMS.get(code);
  if (!room) {
    throw new Error(`Room ${code} not found`);
  }

  return room;
}

// Create a default test room
const testRoom = {
  code: "TEST01",
  name: "Test Adventure",
  id: "room_TEST01",
  host: "mock_host_id",
  players: [],
  aiModel: "gpt-4",
  status: "waiting",
};
MOCK_ROOMS.set("TEST01", testRoom);

console.log("Mock API initialized. Test room code: TEST01");

// --- Fine-tuning mock ---
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
  model?: string;
  temperature?: number;
  maxTokens?: number;
  trainingData?: string;
  trainingSteps?: number;
  learningRate?: number;
  quantization?: string;
}

const MOCK_FINE_TUNES = new Map<string, {
  id: string;
  name: string;
  description: string;
  config: FineTuningRequest;
}>();

export async function createFineTunedDM(request: FineTuningRequest) {
  await new Promise((resolve) => setTimeout(resolve, 500));
  const id = `ft_${Math.random().toString(36).substring(2, 8)}`;
  const model = {
    id,
    name: request.campaignStyle || "Custom DM",
    description: request.worldDescription.slice(0, 60),
    config: request,
  };
  MOCK_FINE_TUNES.set(id, model);
  return { id: model.id, name: model.name, description: model.description };
}

export async function testFineTunedDM(
  request: FineTuningRequest,
  message: string
) {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return {
    response: `(${request.campaignStyle}) AI DM: ${message}`,
  };
}
