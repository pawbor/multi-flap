# 🐦 Multi Flap - Multiplayer Flappy Bird

A real-time multiplayer Flappy Bird game where players compete simultaneously in the same game world. Built with Fastify, WebSockets, and HTML5 Canvas for smooth, responsive gameplay.

## 🎮 Features

- **Real-time Multiplayer**: Up to 8 players can play simultaneously
- **Server Authority**: All game logic runs on the server to prevent cheating
- **Live Leaderboard**: See scores and player status in real-time
- **Responsive Controls**: Space key or click to jump
- **Smooth Graphics**: 60 FPS gameplay with HTML5 Canvas
- **Player Identification**: Each player has a unique color and name

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- pnpm (or npm/yarn)

### Installation

1. **Clone and install dependencies:**
```bash
git clone <your-repo>
cd multi-flap
pnpm install
```

2. **Start the development server:**
```bash
pnpm dev
```

3. **Open the game:**
   - Game client: http://localhost:3000
   - WebSocket server runs on: ws://localhost:8080

### Production Build

```bash
pnpm build
pnpm start
```

## 🎯 How to Play

1. **Join the game** by entering your name
2. **Press Space** or click "Jump" to make your bird fly
3. **Avoid the pipes** - hitting them ends your game
4. **Compete** with other players for the highest score
5. **Watch the leaderboard** to see how you're doing

## 🏗️ Architecture

### Backend (Server)
- **Fastify**: Fast HTTP server for serving static files
- **WebSocket (ws)**: Real-time communication with clients
- **Game Loop**: 60 FPS server-side physics and collision detection
- **TypeScript**: Type-safe game logic

### Frontend (Client)
- **HTML5 Canvas**: Smooth 2D rendering
- **WebSocket Client**: Real-time communication with server
- **Vanilla JavaScript**: Lightweight client-side code

### Game Flow
```
Client connects → Server adds player → Game loop updates physics → 
Server broadcasts state → Clients render → Repeat at 60 FPS
```

## 🔧 Configuration

Game constants can be modified in `src/server.ts`:

```typescript
const GAME_CONFIG = {
  GRAVITY: 0.5,          // How fast birds fall
  JUMP_FORCE: -8,        // Jump strength
  PIPE_SPEED: 2,         // Pipe movement speed
  PIPE_GAP: 150,         // Gap between pipes
  PIPE_SPAWN_RATE: 180,  // Frames between new pipes
  // ... more settings
};
```

## 📁 Project Structure

```
multi-flap/
├── src/
│   └── server.ts          # Game server with WebSocket handling
├── public/
│   ├── index.html         # Game client interface
│   └── client.js          # Client-side game logic
├── package.json           # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
└── README.md             # This file
```

## 🔌 API Reference

### WebSocket Messages

**Client → Server:**
```json
{ "type": "join", "name": "PlayerName" }
{ "type": "jump" }
```

**Server → Client:**
```json
{
  "type": "gameUpdate",
  "players": [
    {
      "id": "abc123",
      "name": "Player1", 
      "x": 100,
      "y": 300,
      "score": 5,
      "alive": true
    }
  ],
  "pipes": [
    {
      "x": 400,
      "topHeight": 200,
      "bottomY": 350,
      "passed": false
    }
  ]
}
```

## 🛠️ Development

### Available Scripts

- `pnpm dev` - Start development server with hot reload
- `pnpm build` - Build TypeScript to JavaScript
- `pnpm start` - Start production server
- `pnpm test` - Run tests (not implemented yet)

### Adding Features

1. **New game mechanics**: Modify `GameServer` class in `src/server.ts`
2. **UI improvements**: Update `public/index.html` and `public/client.js`
3. **Visual effects**: Enhance the Canvas rendering in `client.js`

## 🐛 Troubleshooting

**Connection Issues:**
- Make sure both HTTP (3000) and WebSocket (8080) ports are available
- Check firewall settings if playing across networks

**Performance Issues:**
- Game runs at 60 FPS - reduce frame rate if needed
- Consider limiting max players for lower-end servers

## 📝 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a Pull Request

## 🎯 Future Enhancements

- [ ] Power-ups and special abilities
- [ ] Different game modes (teams, battle royale)
- [ ] Player authentication and persistent scores
- [ ] Mobile-responsive touch controls
- [ ] Sound effects and background music
- [ ] Spectator mode
- [ ] Replay system
