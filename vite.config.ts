import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    // Vercel handles the root path automatically, so we remove "base: './'"
    define: {
      // Map 'process.env.API_KEY' in the code to the 'VITE_API_KEY' environment variable from Vercel
      'process.env.API_KEY': JSON.stringify(env.VITE_API_KEY),
      // Prevent "process is not defined" error in browser
      'process.env': {}
    }
  };
});