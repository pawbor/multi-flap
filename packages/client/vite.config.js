import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  server: {
    port: Number(process.env.CLIENT_PORT) || 3002,
    open: true,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
