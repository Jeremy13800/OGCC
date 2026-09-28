import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, mergeConfig } from 'vite';
import { sharedConfig } from './vite.shared.ts';

/** Content script build: one self-contained IIFE, CSS inlined as a string for the Shadow DOM. */
export default defineConfig(({ mode }) =>
  mergeConfig(sharedConfig(mode), {
    plugins: [react(), tailwindcss()],
    // No public/ copy here, the pages build already handles it.
    publicDir: false,
    build: {
      rolldownOptions: {
        input: { content: 'src/content/index.ts' },
        output: {
          format: 'iife',
          entryFileNames: 'content.js',
        },
      },
    },
  }),
);
