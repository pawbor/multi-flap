<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Multi Flap - Multiplayer Flappy Bird Game

This is a real-time multiplayer Flappy Bird game built with:
- **Backend**: Fastify + WebSockets (ws) + TypeScript
- **Frontend**: HTML5 Canvas + Vanilla JavaScript
- **Architecture**: Client-Server with authoritative server

## Key Components:
- `src/server.ts` - Game server with physics, collision detection, and player synchronization
- `public/index.html` - Game client interface
- `public/client.js` - Client-side game rendering and WebSocket communication

## Game Features:
- Real-time multiplayer with up to 8 players
- Server-side physics and collision detection
- Player synchronization via WebSocket
- Leaderboard and scoring system
- Responsive controls (Space key or click to jump)

## Development Guidelines:
- Keep game logic on server to prevent cheating
- Use 60 FPS game loop for smooth gameplay
- Maintain consistent game state across all clients
- Handle player disconnections gracefully
- Use TypeScript for type safety on server-side
