import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// In development every request to /api/** is proxied to the Spring Cloud API Gateway,
// so the browser sees a single origin and no CORS configuration is needed.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const gateway = env.VITE_GATEWAY_URL || 'http://localhost:8080';

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api': { target: gateway, changeOrigin: true },
      },
    },
  };
});
