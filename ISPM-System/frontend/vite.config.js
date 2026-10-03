import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const apiTarget = new URL(env.VITE_API_BASE_URL || 'http://localhost:5001/api').origin;

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          // The browser talks to Vite; this upstream request needs no CORS origin.
          bypass(req) {
            delete req.headers.origin;
          },
        },
      },
    },
  };
});
