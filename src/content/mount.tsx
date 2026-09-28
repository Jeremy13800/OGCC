import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import css from '@/styles/ogcc.css?inline';
import type { PreferencesStore } from '@/storage/preferences';
import { InPageApp } from '@/ui/app/InPageApp';
import { ErrorBoundary } from '@/ui/components/ErrorBoundary';
import { PreferencesProvider } from '@/ui/hooks/preferences';
import type { PageInfo } from '@/ui/status/StatusSection';
import { prepareShadowCss } from '@/ui/theme/shadow-styles';

export const HOST_TAG = 'ogcc-root';

/**
 * Mounts the OGCC React tree in its own Shadow DOM so that neither OGame nor OGLight
 * styles leak in, and OGCC styles never leak out. Returns an unmount function.
 */
export function mountInPageApp(options: {
  readonly store: PreferencesStore;
  readonly page: PageInfo;
  readonly version: string;
}): () => void {
  // Guard against double injection (e.g. extension reloaded while the tab stays open).
  document.querySelector(HOST_TAG)?.remove();

  // Custom element name: page rules targeting div/span/etc. cannot match the host,
  // and `all: initial` stops inherited page styles (font, color…) at the boundary.
  const host = document.createElement(HOST_TAG);
  host.setAttribute('data-ogcc-root', '');
  host.style.setProperty('all', 'initial');

  const shadow = host.attachShadow({ mode: 'open' });
  const style = document.createElement('style');
  style.textContent = prepareShadowCss(css);
  const container = document.createElement('div');
  container.setAttribute('data-ogcc-app', '');
  shadow.append(style, container);
  document.body.append(host);

  const root = createRoot(container);
  root.render(
    <StrictMode>
      <ErrorBoundary>
        <PreferencesProvider store={options.store}>
          <InPageApp page={options.page} version={options.version} />
        </PreferencesProvider>
      </ErrorBoundary>
    </StrictMode>,
  );

  return () => {
    root.unmount();
    host.remove();
  };
}
