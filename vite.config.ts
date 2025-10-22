import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
    proxy: {
      '/.netlify/functions/api': {
        target: 'https://so-monitoring.infinityfree.me/salespro/api.php',
        changeOrigin: true,
        rewrite: (path) => path.replace('/.netlify/functions/api', ''),
      },
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});