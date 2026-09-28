import { detectOGamePage, shouldMountOn } from '@/ogame/page-detector';
import { readOGameMeta } from '@/ogame/parsers/meta';
import { ogameSelectors } from '@/ogame/selectors';
import { createLogger, setDebugEnabled } from '@/shared/logger';
import { chromeLocalArea } from '@/storage/key-value-area';
import { createPreferencesStore, type Preferences } from '@/storage/preferences';
import { applyModernTheme } from './modern-theme';
import { mountInPageApp } from './mount';

/**
 * Content script entry point. Read-only with respect to the game: it observes,
 * never clicks, submits or sends game requests (see docs/compliance.md).
 * Any failure here is contained: OGame must keep working without OGCC.
 */

const log = createLogger('content');

async function bootstrap(): Promise<void> {
  if (window.top !== window) return;

  const page = detectOGamePage(location.href);
  if (!page || !shouldMountOn(page, location.href)) return;

  const store = createPreferencesStore(chromeLocalArea());
  const applyPreferences = (preferences: Preferences) => {
    setDebugEnabled(preferences.developer.debug);
    applyModernTheme(preferences.features.modernUI);
  };
  applyPreferences(await store.load());
  store.subscribe(() => {
    applyPreferences(store.getSnapshot());
  });

  const meta = readOGameMeta(document);
  log.debug('Page detected', page, meta);

  mountInPageApp({
    store,
    version: chrome.runtime.getManifest().version,
    page: {
      view: page.rawView,
      universe: page.server.host.split('.')[0] ?? page.server.host,
      metaFound: Object.keys(meta).length,
      metaTotal: Object.keys(ogameSelectors.meta).length,
    },
  });
  log.info('OGCC is running');
}

bootstrap().catch((error: unknown) => {
  log.error('Bootstrap failed — OGCC disabled on this page.', error);
});
