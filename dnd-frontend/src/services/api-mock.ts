// Mock API service for testing navigation without backend
const MOCK_ROOMS = new Map<string, any>();

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
