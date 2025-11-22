import { defineConfig } from "vite";
import dyadComponentTagger from "@dyad-sh/react-vite-component-tagger";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(() => ({
  server: {
    host: "::",
    port: 5173, // Zmieniono port na 5173, aby uniknąć konfliktu z backendem
    proxy: {
      // Proxy dla zapytań do /api, aby ominąć problemy z CORS w środowisku deweloperskim
      '/api': {
        target: 'http://localhost:8080', // Adres Twojego backendu w Rust
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  plugins: [dyadComponentTagger(), react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));