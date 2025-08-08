<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->


# IMPORTANT: Always consult the user before making any changes. Never make assumptions or take action without explicit user approval. Always ask questions if anything is unclear or if there are multiple possible approaches. Do not guess or proceed without confirmation.

# Multi Flap - Multiplayer Flappy Bird Game

This is a real-time multiplayer Flappy Bird game built with:
- **Backend**: Fastify + WebSockets (ws) + TypeScript
- **Frontend**: Vite + HTML5 Canvas + Vanilla JavaScript
- **Architecture**: Monorepo with Turborepo, pnpm workspaces, client-server with authoritative server

## Project Structure:
- `packages/server/` - Game server (Fastify + WebSocket + TypeScript)
- `packages/client/` - Game client (Vite + HTML5 Canvas + JavaScript)
- `packages/shared/` - Shared types and configuration
- Root level - Turborepo configuration and workspace management

## Key Components:
- `packages/server/src/server.ts` - Game server with physics, collision detection, and player synchronization
- `packages/server/src/network/NetworkManager.ts` - WebSocket connection management
- `packages/client/index.html` - Game client interface
- `packages/client/main.js` - Client-side game rendering and WebSocket communication
- `packages/shared/src/types.ts` - Shared TypeScript interfaces
- `packages/shared/src/config.ts` - Game configuration constants

## Development Commands:
- `pnpm dev` - Start both server and client in development mode
- `pnpm build` - Build all packages
- `pnpm --filter @multi-flap/server dev` - Start only server
- `pnpm --filter @multi-flap/client dev` - Start only client

## Environment Configuration:
- Server: `packages/server/.env` (HTTP_PORT, WS_PORT)
- Client: `packages/client/.env` (VITE_WS_HOST, VITE_WS_PORT, CLIENT_PORT)

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
- Use TypeScript for type safety on server-side and shared code
- Use environment variables for configuration
- Follow monorepo best practices with workspace dependencies
