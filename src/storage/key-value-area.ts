/**
 * Minimal key/value storage contract. Production uses chrome.storage.local;
 * tests use the in-memory implementation.
 */
export interface KeyValueArea {
  get(key: string): Promise<unknown>;
  set(key: string, value: unknown): Promise<void>;
  /** Calls `listener` whenever `key` changes (from any extension context). Returns an unsubscribe function. */
  subscribe(key: string, listener: (value: unknown) => void): () => void;
}

export function chromeLocalArea(): KeyValueArea {
  return {
    async get(key) {
      const items = await chrome.storage.local.get(key);
      return items[key];
    },
    async set(key, value) {
      await chrome.storage.local.set({ [key]: value });
    },
    subscribe(key, listener) {
      const onChanged = (changes: Record<string, chrome.storage.StorageChange>, area: string) => {
        const change = changes[key];
        if (area === 'local' && change) listener(change.newValue);
      };
      chrome.storage.onChanged.addListener(onChanged);
      return () => {
        chrome.storage.onChanged.removeListener(onChanged);
      };
    },
  };
}

export function memoryArea(initial: Record<string, unknown> = {}): KeyValueArea {
  const data = new Map(Object.entries(initial));
  const listeners = new Map<string, Set<(value: unknown) => void>>();
  return {
    get(key) {
      return Promise.resolve(structuredClone(data.get(key)));
    },
    set(key, value) {
      data.set(key, structuredClone(value));
      listeners.get(key)?.forEach((listener) => {
        listener(structuredClone(value));
      });
      return Promise.resolve();
    },
    subscribe(key, listener) {
      const set = listeners.get(key) ?? new Set();
      set.add(listener);
      listeners.set(key, set);
      return () => set.delete(listener);
    },
  };
}
