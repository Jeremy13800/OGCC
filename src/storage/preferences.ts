import { FEATURES, FEATURE_KEYS, type FeatureFlags } from '@/shared/features';
import { createLogger } from '@/shared/logger';
import type { KeyValueArea } from './key-value-area';

/**
 * User preferences, stored in chrome.storage.local (shared by the content script
 * and the popup, changes propagate live). Historical data goes to IndexedDB instead.
 */

export const PREFERENCES_KEY = 'ogcc:preferences';
export const PREFERENCES_SCHEMA_VERSION = 1;

export interface Preferences {
  readonly schemaVersion: typeof PREFERENCES_SCHEMA_VERSION;
  readonly features: FeatureFlags;
  readonly appearance: {
    readonly animations: boolean;
    readonly compactPlanets: boolean;
  };
  readonly developer: {
    readonly debug: boolean;
  };
}

export const DEFAULT_PREFERENCES: Preferences = {
  schemaVersion: PREFERENCES_SCHEMA_VERSION,
  features: Object.fromEntries(
    FEATURE_KEYS.map((key) => [key, FEATURES[key].defaultEnabled]),
  ) as FeatureFlags,
  appearance: { animations: true, compactPlanets: false },
  developer: { debug: false },
};

const log = createLogger('preferences');

/**
 * Turns whatever is stored (older schema, partial object, corrupted value) into a
 * valid Preferences object. Unknown keys are dropped, wrong types fall back to defaults.
 */
export function sanitizePreferences(raw: unknown): Preferences {
  const source = asRecord(raw);
  const features = asRecord(source.features);
  const appearance = asRecord(source.appearance);
  const developer = asRecord(source.developer);
  const defaults = DEFAULT_PREFERENCES;

  return {
    schemaVersion: PREFERENCES_SCHEMA_VERSION,
    features: Object.fromEntries(
      FEATURE_KEYS.map((key) => [key, bool(features[key], defaults.features[key])]),
    ) as FeatureFlags,
    appearance: {
      animations: bool(appearance.animations, defaults.appearance.animations),
      compactPlanets: bool(appearance.compactPlanets, defaults.appearance.compactPlanets),
    },
    developer: {
      debug: bool(developer.debug, defaults.developer.debug),
    },
  };
}

/** Members are plain closures (no `this`), safe to pass around detached. */
export interface PreferencesStore {
  /** Current value (defaults until `load` resolves). Stable reference between changes. */
  readonly getSnapshot: () => Preferences;
  readonly load: () => Promise<Preferences>;
  readonly update: (recipe: (current: Preferences) => Preferences) => Promise<void>;
  readonly subscribe: (listener: () => void) => () => void;
  readonly dispose: () => void;
}

export function createPreferencesStore(area: KeyValueArea): PreferencesStore {
  let current = DEFAULT_PREFERENCES;
  const listeners = new Set<() => void>();

  const setCurrent = (next: Preferences) => {
    current = next;
    listeners.forEach((listener) => {
      listener();
    });
  };

  const unsubscribeArea = area.subscribe(PREFERENCES_KEY, (value) => {
    setCurrent(sanitizePreferences(value));
  });

  return {
    getSnapshot: () => current,
    async load() {
      try {
        setCurrent(sanitizePreferences(await area.get(PREFERENCES_KEY)));
      } catch (error) {
        log.warn('Could not read preferences, using defaults.', error);
      }
      return current;
    },
    async update(recipe) {
      const next = sanitizePreferences(recipe(current));
      setCurrent(next);
      await area.set(PREFERENCES_KEY, next);
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    dispose() {
      unsubscribeArea();
      listeners.clear();
    },
  };
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {};
}

function bool(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}
