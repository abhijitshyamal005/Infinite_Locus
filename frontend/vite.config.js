import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: `/`,
  plugins: [react()],
  server: {
    proxy: {
      // REST API
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      // Socket.IO (websocket + polling)
      '/socket.io': {
        target: 'http://localhost:8080',
        ws: true,
        changeOrigin: true,
      },
    },
  },
})