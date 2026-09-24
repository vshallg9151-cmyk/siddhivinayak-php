import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
// PHP + MySQL Backend (XAMPP) — No Node.js OTP plugin required
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // During development: proxy /api requests to XAMPP Apache at localhost:80
      '/api': {
        target: 'http://localhost',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/siddhivinayak-tours-PHP/api')
      }
    }
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['lucide-react', 'framer-motion']
        }
      }
    }
  }
});
