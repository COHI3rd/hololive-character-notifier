import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/',
  css: {
    postcss: './postcss.config.js'
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    }
  }
});
