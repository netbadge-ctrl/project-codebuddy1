import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.DB_HOST': JSON.stringify(env.DB_HOST),
        'process.env.DB_PORT': JSON.stringify(env.DB_PORT),
        'process.env.DB_USER': JSON.stringify(env.DB_USER),
        'process.env.DB_PASSWORD': JSON.stringify(env.DB_PASSWORD),
        'process.env.DB_NAME': JSON.stringify(env.DB_NAME)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
