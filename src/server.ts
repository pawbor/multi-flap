import Fastify from 'fastify';
import { WebSocketServer } from 'ws';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Game constants
const GAME_CONFIG = {
  GRAVITY: 0.5,
  JUMP_FORCE: -8,
  PIPE_SPEED: 2,
  PIPE_GAP: 150,
  PIPE_WIDTH: 50,
  BIRD_SIZE: 20,
  GAME_WIDTH: 800,
  GAME_HEIGHT: 600,
  PIPE_SPAWN_RATE: 180, // frames
};

// Game state
interface Player {
  id: string;
  name: string;
  x: number;
  y: number;
  velocityY: number;
  score: number;
  alive: boolean;
  ws: any;
}

interface Pipe {
  x: number;
  topHeight: number;
  bottomY: number;
  passed: boolean;
}

class GameServer {
  private players: Map<string, Player> = new Map();
  private pipes: Pipe[] = [];
  private gameRunning = false;
  private frameCount = 0;
  private gameLoop: NodeJS.Timeout | null = null;

  constructor(private wss: WebSocketServer) {
    this.setupWebSocketServer();
    this.startGame();
  }

  private setupWebSocketServer() {
    this.wss.on('connection', (ws) => {
      console.log('New player connected');
      
      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleMessage(ws, message);
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      });

      ws.on('close', () => {
        this.removePlayer(ws);
      });
    });
  }

  private handleMessage(ws: any, message: any) {
    switch (message.type) {
      case 'join':
        this.addPlayer(ws, message.name || 'Anonymous');
        break;
      case 'jump':
        this.playerJump(ws);
        break;
    }
  }

  private addPlayer(ws: any, name: string) {
    const playerId = Math.random().toString(36).substring(7);
    const player: Player = {
      id: playerId,
      name,
      x: 100,
      y: GAME_CONFIG.GAME_HEIGHT / 2,
      velocityY: 0,
      score: 0,
      alive: true,
      ws,
    };

    this.players.set(playerId, player);
    ws.playerId = playerId;

    // Send initial game state to new player
    ws.send(JSON.stringify({
      type: 'gameState',
      players: Array.from(this.players.values()).map(p => ({
        id: p.id,
        name: p.name,
        x: p.x,
        y: p.y,
        score: p.score,
        alive: p.alive,
      })),
      pipes: this.pipes,
    }));

    console.log(`Player ${name} (${playerId}) joined the game`);
  }

  private removePlayer(ws: any) {
    if (ws.playerId) {
      this.players.delete(ws.playerId);
      console.log(`Player ${ws.playerId} left the game`);
    }
  }

  private playerJump(ws: any) {
    const player = this.players.get(ws.playerId);
    if (player && player.alive) {
      player.velocityY = GAME_CONFIG.JUMP_FORCE;
    }
  }

  private startGame() {
    this.gameRunning = true;
    this.gameLoop = setInterval(() => {
      this.updateGame();
      this.broadcastGameState();
    }, 1000 / 60); // 60 FPS
  }

  private updateGame() {
    this.frameCount++;

    // Update players
    for (const player of this.players.values()) {
      if (!player.alive) continue;

      // Apply gravity
      player.velocityY += GAME_CONFIG.GRAVITY;
      player.y += player.velocityY;

      // Check boundaries
      if (player.y < 0 || player.y > GAME_CONFIG.GAME_HEIGHT - GAME_CONFIG.BIRD_SIZE) {
        player.alive = false;
        continue;
      }

      // Check pipe collisions
      for (const pipe of this.pipes) {
        if (this.checkCollision(player, pipe)) {
          player.alive = false;
          break;
        }

        // Check if player passed pipe
        if (!pipe.passed && player.x > pipe.x + GAME_CONFIG.PIPE_WIDTH) {
          pipe.passed = true;
          player.score++;
        }
      }
    }

    // Spawn new pipes
    if (this.frameCount % GAME_CONFIG.PIPE_SPAWN_RATE === 0) {
      this.spawnPipe();
    }

    // Update pipes
    this.pipes = this.pipes.filter(pipe => {
      pipe.x -= GAME_CONFIG.PIPE_SPEED;
      return pipe.x > -GAME_CONFIG.PIPE_WIDTH;
    });
  }

  private spawnPipe() {
    const gapStart = Math.random() * (GAME_CONFIG.GAME_HEIGHT - GAME_CONFIG.PIPE_GAP - 100) + 50;
    
    this.pipes.push({
      x: GAME_CONFIG.GAME_WIDTH,
      topHeight: gapStart,
      bottomY: gapStart + GAME_CONFIG.PIPE_GAP,
      passed: false,
    });
  }

  private checkCollision(player: Player, pipe: Pipe): boolean {
    const playerLeft = player.x;
    const playerRight = player.x + GAME_CONFIG.BIRD_SIZE;
    const playerTop = player.y;
    const playerBottom = player.y + GAME_CONFIG.BIRD_SIZE;

    const pipeLeft = pipe.x;
    const pipeRight = pipe.x + GAME_CONFIG.PIPE_WIDTH;

    // Check if player is within pipe's x range
    if (playerRight > pipeLeft && playerLeft < pipeRight) {
      // Check if player hits top or bottom pipe
      if (playerTop < pipe.topHeight || playerBottom > pipe.bottomY) {
        return true;
      }
    }

    return false;
  }

  private broadcastGameState() {
    const gameState = {
      type: 'gameUpdate',
      players: Array.from(this.players.values()).map(p => ({
        id: p.id,
        name: p.name,
        x: p.x,
        y: p.y,
        score: p.score,
        alive: p.alive,
      })),
      pipes: this.pipes,
    };

    const message = JSON.stringify(gameState);
    for (const player of this.players.values()) {
      if (player.ws.readyState === 1) { // WebSocket.OPEN
        player.ws.send(message);
      }
    }
  }
}

// Initialize Fastify
const fastify = Fastify({ logger: true });

// Serve static files
await fastify.register(import('@fastify/static'), {
  root: join(__dirname, '../public'),
  prefix: '/', 
});

// WebSocket server
const wss = new WebSocketServer({ port: 8080 });
const gameServer = new GameServer(wss);

// Start HTTP server
const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
    console.log('🚀 HTTP Server running on http://localhost:3000');
    console.log('🎮 WebSocket Server running on ws://localhost:8080');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
