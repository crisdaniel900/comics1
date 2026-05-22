import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5100",  // ← sin /api al final
        changeOrigin: true,
        // ← sin rewrite, dejar el path tal cual
      },
    },
  },
});
