import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@/styles/ogcc.css';
import { t } from '@/shared/i18n';
import { setDebugEnabled } from '@/shared/logger';
import { chromeLocalArea } from '@/storage/key-value-area';
import { createPreferencesStore } from '@/storage/preferences';
import { ErrorBoundary } from '@/ui/components/ErrorBoundary';
import { PreferencesProvider } from '@/ui/hooks/preferences';
import { SettingsPanel } from '@/ui/settings/SettingsPanel';
import { StatusSection } from '@/ui/status/StatusSection';

/**
 * Toolbar popup: same settings as the in-page panel. Also the safety valve to turn
 * Modern UI off if the in-page interface is ever unusable.
 */
function Popup() {
  return (
    <main className="w-[360px] bg-space-950">
      <header className="flex items-baseline justify-between border-b border-line bg-surface-900 px-4 py-3">
        <h1 className="text-base font-semibold tracking-wide text-fg">{t('app.name')}</h1>
        <span className="ogcc-meta">{t('app.version', { version: chrome.runtime.getManifest().version })}</span>
      </header>
      <StatusSection />
      <SettingsPanel />
      <p className="ogcc-meta border-t border-line px-4 py-3">{t('app.localOnly')}</p>
    </main>
  );
}

const store = createPreferencesStore(chromeLocalArea());
void store.load().then((preferences) => {
  setDebugEnabled(preferences.developer.debug);
});

const container = document.getElementById('ogcc-popup');
if (container) {
  createRoot(container).render(
    <StrictMode>
      <ErrorBoundary>
        <PreferencesProvider store={store}>
          <Popup />
        </PreferencesProvider>
      </ErrorBoundary>
    </StrictMode>,
  );
}
