import { useEffect, useId, useRef, useState } from 'react';
import { t } from '@/shared/i18n';
import { SettingsPanel } from '../settings/SettingsPanel';
import { StatusSection, type PageInfo } from '../status/StatusSection';
import { usePreferences } from '../hooks/preferences';

/**
 * In-page OGCC entry point: a small, non-intrusive launcher in a corner of the game,
 * opening a panel with status and settings. Rendered inside OGCC's Shadow DOM.
 */
export function InPageApp({ page, version }: { readonly page: PageInfo; readonly version: string }) {
  const [preferences] = usePreferences();
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const launcherRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    panelRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      launcherRef.current?.focus();
    };
    // Listen on the window but only react to Escape; never block OGame's own shortcuts.
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div
      data-ogcc-animations={preferences.appearance.animations ? 'on' : 'off'}
      className="fixed bottom-3 left-3 z-[2147483000] flex flex-col items-start gap-2 font-sans"
    >
      {open && (
        <div
          id={panelId}
          ref={panelRef}
          role="dialog"
          aria-label={t('app.name')}
          tabIndex={-1}
          className="ogcc-surface flex max-h-[calc(100vh-72px)] w-[340px] animate-panel-in flex-col overflow-hidden outline-none"
        >
          <header className="flex items-center justify-between border-b border-line bg-surface-800/60 px-4 py-2.5">
            <div>
              <p className="text-sm font-semibold tracking-wide text-fg">{t('app.name')}</p>
              <p className="ogcc-meta">{t('app.version', { version })}</p>
            </div>
            <button
              type="button"
              aria-label={t('app.closePanel')}
              onClick={() => {
                setOpen(false);
                launcherRef.current?.focus();
              }}
              className="grid size-8 place-items-center rounded-sm text-fg-muted transition-colors hover:bg-surface-600 hover:text-fg"
            >
              <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
              </svg>
            </button>
          </header>
          <div className="overflow-y-auto">
            <StatusSection page={page} showDiagnostics={preferences.developer.debug} />
            <SettingsPanel />
            <p className="ogcc-meta border-t border-line px-4 py-3">{t('app.localOnly')}</p>
          </div>
        </div>
      )}

      <button
        ref={launcherRef}
        type="button"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-label={open ? t('app.closePanel') : t('app.openPanel')}
        title={t('app.running')}
        onClick={() => {
          setOpen((value) => !value);
        }}
        className="group flex h-8 items-center gap-2 rounded-md border border-line-strong bg-space-900/85 px-2.5 text-xs text-fg-muted opacity-75 shadow-panel backdrop-blur-sm transition-all duration-150 hover:border-tech/60 hover:text-fg hover:opacity-100 focus-visible:opacity-100 aria-expanded:border-tech/60 aria-expanded:opacity-100"
      >
        <span aria-hidden="true" className="size-2 animate-pulse-dot rounded-full bg-tech shadow-[0_0_8px_var(--color-tech)]" />
        <span className="font-semibold tracking-[0.14em] text-fg">OGCC</span>
        <span className="hidden sm:inline">{t('app.running')}</span>
      </button>
    </div>
  );
}
