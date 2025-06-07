import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/hololive-character-notifier/' : '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    }
  }
});
