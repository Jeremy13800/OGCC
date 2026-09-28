import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, mergeConfig } from 'vite';
import { sharedConfig } from './vite.shared.ts';

/**
 * Extension pages build: toolbar popup + background service worker (ES modules).
 * The content script has its own build (vite.content.config.ts) because MV3
 * content scripts cannot be ES modules and must be a single classic script.
 */
export default defineConfig(({ mode }) =>
  mergeConfig(sharedConfig(mode), {
    plugins: [react(), tailwindcss()],
    build: {
      rolldownOptions: {
        input: {
          popup: 'popup.html',
          background: 'src/background/service-worker.ts',
        },
        output: {
          entryFileNames: (chunk: { name: string }) =>
            chunk.name === 'background' ? 'background.js' : 'assets/[name]-[hash].js',
        },
      },
    },
  }),
);
