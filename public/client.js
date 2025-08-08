class MultiFlap {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.ws = null;
        this.players = new Map();
        this.pipes = [];
        this.myPlayerId = null;
        this.isConnected = false;
        
        // Game constants (should match server)
        this.GAME_CONFIG = {
            BIRD_SIZE: 20,
            PIPE_WIDTH: 50,
            GAME_WIDTH: 800,
            GAME_HEIGHT: 600,
        };

        // Colors for different players
        this.playerColors = [
            '#e74c3c', '#3498db', '#2ecc71', '#f39c12', 
            '#9b59b6', '#e67e22', '#1abc9c', '#34495e'
        ];

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && this.isConnected) {
                e.preventDefault();
                this.jump();
            }
        });

        // Prevent spacebar from scrolling
        document.addEventListener('keypress', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
            }
        });

        // Enter key in name input
        document.getElementById('playerName').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.joinGame();
            }
        });
    }

    joinGame() {
        const nameInput = document.getElementById('playerName');
        const playerName = nameInput.value.trim();
        
        if (!playerName) {
            alert('Please enter your name!');
            return;
        }

        if (playerName.length > 15) {
            alert('Name must be 15 characters or less!');
            return;
        }

        this.connectToServer(playerName);
    }

    connectToServer(playerName) {
        try {
            this.ws = new WebSocket('ws://localhost:8080');
            
            this.ws.onopen = () => {
                console.log('Connected to game server');
                this.isConnected = true;
                
                // Send join message
                this.ws.send(JSON.stringify({
                    type: 'join',
                    name: playerName
                }));

                // Show game interface
                this.showGameInterface();
            };

            this.ws.onmessage = (event) => {
                const message = JSON.parse(event.data);
                this.handleServerMessage(message);
            };

            this.ws.onclose = () => {
                console.log('Disconnected from server');
                this.isConnected = false;
                this.hideGameInterface();
                alert('Disconnected from server. Please refresh to reconnect.');
            };

            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                alert('Failed to connect to game server. Please make sure the server is running.');
            };

        } catch (error) {
            console.error('Connection error:', error);
            alert('Failed to connect to game server.');
        }
    }

    handleServerMessage(message) {
        switch (message.type) {
            case 'gameState':
            case 'gameUpdate':
                this.updateGameState(message);
                break;
        }
    }

    updateGameState(gameState) {
        // Update players
        this.players.clear();
        gameState.players.forEach((playerData, index) => {
            this.players.set(playerData.id, {
                ...playerData,
                color: this.playerColors[index % this.playerColors.length]
            });
        });

        // Update pipes
        this.pipes = gameState.pipes;

        // Update UI
        this.updateUI();
        
        // Render game
        this.render();
    }

    updateUI() {
        const myPlayer = Array.from(this.players.values()).find(p => p.id === this.myPlayerId);
        
        if (myPlayer) {
            document.getElementById('yourScore').textContent = myPlayer.score;
        }
        
        document.getElementById('playerCount').textContent = this.players.size;
        
        // Update leaderboard
        const playersContent = document.getElementById('playersContent');
        const sortedPlayers = Array.from(this.players.values())
            .sort((a, b) => b.score - a.score);
        
        playersContent.innerHTML = sortedPlayers.map(player => 
            `<div class="player-item ${!player.alive ? 'player-dead' : ''}">
                <span>${player.name}</span>
                <span>${player.score}</span>
            </div>`
        ).join('');
    }

    render() {
        // Clear canvas
        this.ctx.fillStyle = '#87CEEB';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw pipes
        this.ctx.fillStyle = '#2ecc71';
        this.pipes.forEach(pipe => {
            // Top pipe
            this.ctx.fillRect(pipe.x, 0, this.GAME_CONFIG.PIPE_WIDTH, pipe.topHeight);
            
            // Bottom pipe
            this.ctx.fillRect(
                pipe.x, 
                pipe.bottomY, 
                this.GAME_CONFIG.PIPE_WIDTH, 
                this.GAME_CONFIG.GAME_HEIGHT - pipe.bottomY
            );

            // Pipe borders
            this.ctx.strokeStyle = '#27ae60';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(pipe.x, 0, this.GAME_CONFIG.PIPE_WIDTH, pipe.topHeight);
            this.ctx.strokeRect(
                pipe.x, 
                pipe.bottomY, 
                this.GAME_CONFIG.PIPE_WIDTH, 
                this.GAME_CONFIG.GAME_HEIGHT - pipe.bottomY
            );
        });

        // Draw players
        this.players.forEach(player => {
            if (!player.alive) {
                this.ctx.globalAlpha = 0.5;
            }

            // Draw bird
            this.ctx.fillStyle = player.color;
            this.ctx.fillRect(
                player.x, 
                player.y, 
                this.GAME_CONFIG.BIRD_SIZE, 
                this.GAME_CONFIG.BIRD_SIZE
            );

            // Draw bird border
            this.ctx.strokeStyle = '#2c3e50';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(
                player.x, 
                player.y, 
                this.GAME_CONFIG.BIRD_SIZE, 
                this.GAME_CONFIG.BIRD_SIZE
            );

            // Draw player name
            this.ctx.fillStyle = '#2c3e50';
            this.ctx.font = '12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(
                player.name, 
                player.x + this.GAME_CONFIG.BIRD_SIZE / 2, 
                player.y - 5
            );

            this.ctx.globalAlpha = 1;
        });
    }

    jump() {
        if (this.ws && this.isConnected) {
            this.ws.send(JSON.stringify({ type: 'jump' }));
        }
    }

    leaveGame() {
        if (this.ws) {
            this.ws.close();
        }
        this.hideGameInterface();
    }

    showGameInterface() {
        document.getElementById('joinForm').style.display = 'none';
        document.getElementById('gameCanvas').style.display = 'block';
        document.getElementById('gameInfo').style.display = 'flex';
        document.getElementById('playersList').style.display = 'block';
        document.getElementById('controls').style.display = 'flex';
    }

    hideGameInterface() {
        document.getElementById('joinForm').style.display = 'block';
        document.getElementById('gameCanvas').style.display = 'none';
        document.getElementById('gameInfo').style.display = 'none';
        document.getElementById('playersList').style.display = 'none';
        document.getElementById('controls').style.display = 'none';
        
        // Clear name input
        document.getElementById('playerName').value = '';
    }
}

// Initialize game
const game = new MultiFlap();

// Global functions for buttons
function joinGame() {
    game.joinGame();
}

function jump() {
    game.jump();
}

function leaveGame() {
    game.leaveGame();
}
