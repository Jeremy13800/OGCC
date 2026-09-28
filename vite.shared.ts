import { fileURLToPath, URL } from 'node:url';
import type { UserConfig } from 'vite';

/** Options shared by every OGCC build (extension pages + content script). */
export const sharedConfig = (mode: string): UserConfig => ({
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    outDir: 'dist',
    // scripts/build.mjs cleans dist once; each build must not wipe the other's output.
    emptyOutDir: false,
    target: 'chrome120',
    minify: mode === 'production',
    sourcemap: mode === 'production' ? false : 'inline',
    // Extension files are loaded from disk: no need for modulepreload polyfills.
    modulePreload: false,
  },
});
