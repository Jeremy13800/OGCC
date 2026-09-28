// Builds the two OGCC bundles (extension pages + content script) into dist/.
// Usage: node scripts/build.mjs [--watch]
import { rm } from 'node:fs/promises';
import { build } from 'vite';

const watch = process.argv.includes('--watch');
const mode = watch ? 'development' : 'production';

await rm('dist', { recursive: true, force: true });

for (const configFile of ['vite.config.ts', 'vite.content.config.ts']) {
  await build({
    configFile,
    mode,
    logLevel: watch ? 'warn' : 'info',
    build: watch ? { watch: {} } : {},
  });
}

if (watch) {
  console.log('[ogcc] Watching for changes. Reload the extension in chrome://extensions after each rebuild.');
}
