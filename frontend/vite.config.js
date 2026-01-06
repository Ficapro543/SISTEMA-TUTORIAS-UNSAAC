import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Redirige peticiones /api/* al backend local (cambia target si tu backend está en otro host/puerto)
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
        secure: false,
        // rewrite: (path) => path.replace(/^\/api/, "/api"), // opcional según tu backend
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    }
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          pdf: ['@react-pdf/renderer'],
          ui: ['lucide-react'] // Split UI icons
        }
      }
    }
  }
});