import { describe, expect, it, vi } from 'vitest';
import { memoryArea } from './key-value-area';
import {
  DEFAULT_PREFERENCES,
  PREFERENCES_KEY,
  createPreferencesStore,
  sanitizePreferences,
} from './preferences';

describe('sanitizePreferences', () => {
  it.each([undefined, null, 42, 'x', []])('returns defaults for %s', (raw) => {
    expect(sanitizePreferences(raw)).toEqual(DEFAULT_PREFERENCES);
  });

  it('keeps valid values, repairs wrong types and drops unknown keys', () => {
    const result = sanitizePreferences({
      schemaVersion: 0,
      features: { modernUI: true, planner: 'yes', removedFeature: true },
      appearance: { animations: false },
      developer: { debug: true },
      extra: 1,
    });

    expect(result.features.modernUI).toBe(true);
    expect(result.features.planner).toBe(DEFAULT_PREFERENCES.features.planner);
    expect(result.features).not.toHaveProperty('removedFeature');
    expect(result.appearance).toEqual({ animations: false, compactPlanets: false });
    expect(result.developer.debug).toBe(true);
    expect(result).not.toHaveProperty('extra');
    expect(result.schemaVersion).toBe(1);
  });

  it('ships Modern UI disabled by default', () => {
    expect(DEFAULT_PREFERENCES.features.modernUI).toBe(false);
  });
});

describe('createPreferencesStore', () => {
  it('loads, updates and persists', async () => {
    const area = memoryArea({ [PREFERENCES_KEY]: { developer: { debug: true } } });
    const store = createPreferencesStore(area);

    expect((await store.load()).developer.debug).toBe(true);

    await store.update((p) => ({ ...p, features: { ...p.features, modernUI: true } }));
    expect(store.getSnapshot().features.modernUI).toBe(true);
    expect(sanitizePreferences(await area.get(PREFERENCES_KEY)).features.modernUI).toBe(true);
  });

  it('notifies subscribers of changes made by another context', async () => {
    const area = memoryArea();
    const store = createPreferencesStore(area);
    const listener = vi.fn();
    store.subscribe(listener);

    await area.set(PREFERENCES_KEY, { appearance: { animations: false } });

    expect(listener).toHaveBeenCalled();
    expect(store.getSnapshot().appearance.animations).toBe(false);
    store.dispose();
  });

  it('falls back to defaults when storage cannot be read', async () => {
    const area = { ...memoryArea(), get: () => Promise.reject(new Error('context invalidated')) };
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const store = createPreferencesStore(area);
    expect(await store.load()).toEqual(DEFAULT_PREFERENCES);
  });
});
