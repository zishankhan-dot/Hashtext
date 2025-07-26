// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // 3000 port for frontend
    strictPort: true // throws an error if 3000 is taken
  }
});