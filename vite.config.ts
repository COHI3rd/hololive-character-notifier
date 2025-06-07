import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  base: process.env.VERCEL ? '/' : (process.env.NODE_ENV === 'production' ? '/hololive-character-notifier/' : '/'),
  css: {
    postcss: './postcss.config.js'
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    }
  }
});
