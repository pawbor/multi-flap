import 'dotenv/config';
import Fastify from 'fastify';
import { NetworkManager } from './network/NetworkManager.js';

// Configuration from environment variables
const HTTP_PORT = parseInt(process.env.HTTP_PORT || '3000', 10);
const WS_PORT = parseInt(process.env.WS_PORT || '3001', 10);

const fastify = Fastify({ logger: true });

// Initialize network manager for WebSocket connections
const networkManager = new NetworkManager(WS_PORT);

// Add a simple health check endpoint
fastify.get('/health', async () => {
  return { 
    status: 'ok', 
    connections: networkManager.getConnectionCount(),
    timestamp: new Date().toISOString()
  };
});

// Start the server
const start = async (): Promise<void> => {
  try {
    await fastify.listen({ port: HTTP_PORT, host: '0.0.0.0' });
    console.log(`🚀 HTTP Server running on http://localhost:${HTTP_PORT}`);
    console.log(`🎮 WebSocket Server running on ws://localhost:${WS_PORT}`);
    console.log(`💡 Visit http://localhost:${HTTP_PORT}/health to check server status`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
