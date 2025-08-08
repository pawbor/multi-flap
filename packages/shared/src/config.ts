// Game configuration constants
export const GAME_CONFIG = {
  // Physics
  GRAVITY: 0.5,
  JUMP_FORCE: -8,
  
  // Game world
  GAME_WIDTH: 800,
  GAME_HEIGHT: 600,
  BIRD_SIZE: 20,
  
  // Pipes
  PIPE_WIDTH: 50,
  PIPE_GAP: 150,
  PIPE_SPEED: 2,
  PIPE_SPAWN_RATE: 180, // frames (3 seconds at 60fps)
  
  // Server settings
  MAX_PLAYERS: 8,
  GAME_FPS: 60,
} as const;
