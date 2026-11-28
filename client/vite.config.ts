/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': '/src' }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:4000', changeOrigin: true }
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (/[\/](quill|react-quill|parchment)[\/]/.test(id)) return 'quill';
          if (/[\/](@chakra-ui|@emotion|framer-motion)[\/]/.test(id)) return 'ui';
          if (/[\/]@hello-pangea[\/]/.test(id)) return 'dnd';
          if (/[\/](react|react-dom|scheduler|react-router|react-router-dom|@remix-run|@reduxjs|react-redux|redux|immer|reselect)[\/]/.test(id)) return 'react-vendor';
          // No catch-all "vendor" chunk: it created a vendor <-> react-vendor import cycle,
          // so vendor ran before React initialised ("reading 'useLayoutEffect'" crash).
        }
      }
    }
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: false
  }
});
