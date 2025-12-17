import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    define: {
      // Map 'process.env.API_KEY' in the code to the 'VITE_API_KEY' environment variable from Vercel
      'process.env.API_KEY': JSON.stringify(env.VITE_API_KEY),
      'process.env': {}
    }
  };
});
