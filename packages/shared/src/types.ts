// Game state types
export interface Player {
  id: string;
  name: string;
  x: number;
  y: number;
  velocityY: number;
  score: number;
  alive: boolean;
}

export interface Pipe {
  x: number;
  topHeight: number;
  bottomY: number;
  passed: boolean;
}

// WebSocket message types
export interface JoinMessage {
  type: 'join';
  name?: string;
}

export interface JumpMessage {
  type: 'jump';
}

export interface GameStateMessage {
  type: 'gameState';
  players: Player[];
  pipes: Pipe[];
}

export interface GameUpdateMessage {
  type: 'gameUpdate';
  players: Player[];
  pipes: Pipe[];
}

export interface ErrorMessage {
  type: 'error';
  message: string;
}

// Union types for type safety
export type ClientMessage = JoinMessage | JumpMessage;
export type ServerMessage = GameStateMessage | GameUpdateMessage | ErrorMessage;
