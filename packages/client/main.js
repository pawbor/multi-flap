const status = document.getElementById('status');
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// Use VITE_WS_HOST and VITE_WS_PORT from environment variables (set in .env)
const WS_HOST = import.meta.env.VITE_WS_HOST || location.hostname;
const WS_PORT = import.meta.env.VITE_WS_PORT || 3001;
const WS_URL = `ws://${WS_HOST}:${WS_PORT}`;

let ws;

function connect() {
  status.textContent = 'Connecting to server...';
  ws = new WebSocket(WS_URL);

  ws.onopen = () => {
    status.textContent = 'Connected! Waiting for game state...';
    // Optionally, send a join message here
  };

  ws.onmessage = (event) => {
    // For now, just log the message
    status.textContent = 'Game state received! (see console)';
    console.log('Server:', event.data);
    // TODO: Parse and render game state
  };

  ws.onclose = () => {
    status.textContent = 'Disconnected. Reconnecting in 2s...';
    setTimeout(connect, 2000);
  };

  ws.onerror = (err) => {
    status.textContent = 'WebSocket error.';
    console.error('WebSocket error:', err);
  };
}

connect();

// Simple blue background for now
ctx.fillStyle = '#87ceeb';
ctx.fillRect(0, 0, canvas.width, canvas.height);
