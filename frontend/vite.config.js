// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // 3000 port for frontend
    strictPort: true, // throws an error if 3000 is taken
    https: false, // Disable HTTPS for now to avoid SSL issues
    host: true // Allow external connections
  },
  // Alternative HTTPS config for when certificates are available
  define: {
    __DEV_HTTPS__: JSON.stringify(process.env.DEV_HTTPS === 'true')
  }
});