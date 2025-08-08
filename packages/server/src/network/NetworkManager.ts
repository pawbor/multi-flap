import { WebSocketServer, WebSocket } from 'ws';
import type { ClientMessage, ServerMessage } from '@multi-flap/shared';

// Extended WebSocket interface to include custom properties
interface PlayerWebSocket extends WebSocket {
  playerId?: string;
  playerName?: string;
}

export class NetworkManager {
  private wss: WebSocketServer;
  private connections = new Map<string, PlayerWebSocket>();

  constructor(port: number) {
    this.wss = new WebSocketServer({ port });
    this.setupWebSocketServer();
    console.log(`🔌 WebSocket server listening on port ${port}`);
  }

  private setupWebSocketServer(): void {
    this.wss.on('connection', (ws: PlayerWebSocket) => {
      console.log('📱 New client connected');
      
      // Handle incoming messages
      ws.on('message', (data) => {
        try {
          const message: ClientMessage = JSON.parse(data.toString());
          this.handleClientMessage(ws, message);
        } catch (error) {
          console.error('❌ Error parsing message:', error);
          this.sendError(ws, 'Invalid message format');
        }
      });

      // Handle client disconnect
      ws.on('close', () => {
        this.handleDisconnect(ws);
      });

      // Handle connection errors
      ws.on('error', (error) => {
        console.error('❌ WebSocket error:', error);
      });
    });
  }

  private handleClientMessage(ws: PlayerWebSocket, message: ClientMessage): void {
    switch (message.type) {
      case 'join':
        this.handlePlayerJoin(ws, message.name || 'Anonymous');
        break;
      case 'jump':
        this.handlePlayerJump(ws);
        break;
      default:
        console.warn('⚠️ Unknown message type');
    }
  }

  private handlePlayerJoin(ws: PlayerWebSocket, playerName: string): void {
    // Generate unique player ID
    const playerId = Math.random().toString(36).substring(7);
    
    // Store player info in WebSocket
    ws.playerId = playerId;
    ws.playerName = playerName;
    
    // Add to connections map
    this.connections.set(playerId, ws);
    
    console.log(`🎮 Player "${playerName}" (${playerId}) joined the game`);
    
    // Send acknowledgment back to client
    this.sendToPlayer(playerId, {
      type: 'gameState',
      players: [], // Empty for now
      pipes: []    // Empty for now
    });

    // TODO: Notify other players about new player
  }

  private handlePlayerJump(ws: PlayerWebSocket): void {
    if (ws.playerId) {
      console.log(`🐦 Player ${ws.playerId} jumped`);
      // TODO: Apply jump to game state
    }
  }

  private handleDisconnect(ws: PlayerWebSocket): void {
    if (ws.playerId) {
      this.connections.delete(ws.playerId);
      console.log(`👋 Player ${ws.playerId} disconnected`);
      // TODO: Remove player from game state
    }
  }

  // Send message to specific player
  public sendToPlayer(playerId: string, message: ServerMessage): void {
    const ws = this.connections.get(playerId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  // Send message to all connected players
  public broadcast(message: ServerMessage): void {
    const messageStr = JSON.stringify(message);
    this.connections.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(messageStr);
      }
    });
  }

  // Send error message to player
  private sendError(ws: PlayerWebSocket, errorMessage: string): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'error',
        message: errorMessage
      }));
    }
  }

  // Get current connection count
  public getConnectionCount(): number {
    return this.connections.size;
  }

  // Get connected player IDs
  public getConnectedPlayers(): string[] {
    return Array.from(this.connections.keys());
  }
}
