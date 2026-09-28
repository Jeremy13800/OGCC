import type { MessageKey } from './i18n';

/**
 * Feature flags. Each OGCC module is gated by one flag so an experimental module
 * can be switched off without affecting the rest of the extension.
 */
export const FEATURE_KEYS = [
  'modernUI',
  'commandCenter',
  'planner',
  'expeditionAnalytics',
  'progression',
  'planetAdvisor',
] as const;

export type FeatureKey = (typeof FEATURE_KEYS)[number];
export type FeatureFlags = Record<FeatureKey, boolean>;

export type FeatureStatus =
  /** Usable. */
  | 'available'
  /** Toggle works, module is only partially implemented. */
  | 'preview'
  /** Not implemented yet: the toggle is shown disabled. */
  | 'planned';

export interface FeatureDefinition {
  readonly labelKey: MessageKey;
  readonly status: FeatureStatus;
  readonly defaultEnabled: boolean;
}

export const FEATURES: Readonly<Record<FeatureKey, FeatureDefinition>> = {
  modernUI: { labelKey: 'settings.modernUI', status: 'preview', defaultEnabled: false },
  commandCenter: { labelKey: 'features.commandCenter', status: 'planned', defaultEnabled: true },
  planner: { labelKey: 'features.planner', status: 'planned', defaultEnabled: true },
  expeditionAnalytics: { labelKey: 'features.expeditionAnalytics', status: 'planned', defaultEnabled: true },
  progression: { labelKey: 'features.progression', status: 'planned', defaultEnabled: true },
  planetAdvisor: { labelKey: 'features.planetAdvisor', status: 'planned', defaultEnabled: true },
};

/** A feature runs only if it is implemented AND enabled by the user. */
export function isFeatureActive(flags: FeatureFlags, key: FeatureKey): boolean {
  return FEATURES[key].status !== 'planned' && flags[key];
}
