import { createContext, use, useSyncExternalStore, type ReactNode } from 'react';
import type { Preferences, PreferencesStore } from '@/storage/preferences';

const PreferencesContext = createContext<PreferencesStore | null>(null);

export function PreferencesProvider({
  store,
  children,
}: {
  readonly store: PreferencesStore;
  readonly children: ReactNode;
}) {
  return <PreferencesContext value={store}>{children}</PreferencesContext>;
}

/** Live preferences + updater. Re-renders on changes made from any extension context. */
export function usePreferences(): readonly [Preferences, PreferencesStore['update']] {
  const store = use(PreferencesContext);
  if (!store) throw new Error('usePreferences must be used inside <PreferencesProvider>.');
  const preferences = useSyncExternalStore(store.subscribe, store.getSnapshot);
  return [preferences, store.update];
}
