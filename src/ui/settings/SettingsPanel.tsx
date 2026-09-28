import { useState } from 'react';
import { FEATURES, type FeatureKey } from '@/shared/features';
import { t } from '@/shared/i18n';
import { createLogger } from '@/shared/logger';
import type { Preferences } from '@/storage/preferences';
import { Badge } from '../components/Badge';
import { Section } from '../components/Section';
import { Switch } from '../components/Switch';
import { usePreferences } from '../hooks/preferences';

const log = createLogger('settings');

const MODULES: readonly FeatureKey[] = [
  'commandCenter',
  'planner',
  'expeditionAnalytics',
  'progression',
  'planetAdvisor',
];

/** Settings shared by the in-page panel and the toolbar popup. */
export function SettingsPanel() {
  const [preferences, update] = usePreferences();
  const [saveFailed, setSaveFailed] = useState(false);

  const save = (recipe: (p: Preferences) => Preferences) => {
    update(recipe).then(
      () => {
        setSaveFailed(false);
      },
      (error: unknown) => {
        log.error('Could not save preferences', error);
        setSaveFailed(true);
      },
    );
  };

  const setFeature = (key: FeatureKey, value: boolean) => {
    save((p) => ({ ...p, features: { ...p.features, [key]: value } }));
  };

  const comingSoon = <Badge>{t('settings.comingSoon')}</Badge>;

  return (
    <>
      <Section title={t('settings.appearance')}>
        <Switch
          label={t('settings.modernUI')}
          hint={t('settings.modernUIHint')}
          checked={preferences.features.modernUI}
          onChange={(value) => {
            setFeature('modernUI', value);
          }}
          badge={<Badge tone="tech">Preview</Badge>}
        />
        <Switch
          label={t('settings.animations')}
          checked={preferences.appearance.animations}
          onChange={(animations) => {
            save((p) => ({ ...p, appearance: { ...p.appearance, animations } }));
          }}
        />
        <Switch
          label={t('settings.compactPlanets')}
          checked={preferences.appearance.compactPlanets}
          onChange={(compactPlanets) => {
            save((p) => ({ ...p, appearance: { ...p.appearance, compactPlanets } }));
          }}
          disabled
          badge={comingSoon}
        />
      </Section>

      <Section title={t('settings.modules')}>
        {MODULES.map((key) => {
          const planned = FEATURES[key].status === 'planned';
          return (
            <Switch
              key={key}
              label={t(FEATURES[key].labelKey)}
              // A module that does not exist yet is shown off, whatever its stored default.
              checked={!planned && preferences.features[key]}
              onChange={(value) => {
                setFeature(key, value);
              }}
              disabled={planned}
              badge={planned ? comingSoon : undefined}
            />
          );
        })}
      </Section>

      <Section title={t('settings.developer')}>
        <Switch
          label={t('settings.debug')}
          hint={t('settings.debugHint')}
          checked={preferences.developer.debug}
          onChange={(debug) => {
            save((p) => ({ ...p, developer: { debug } }));
          }}
        />
      </Section>

      {saveFailed && (
        <p role="alert" className="px-4 pb-3 text-xs text-danger">
          {t('settings.saveError')}
        </p>
      )}
    </>
  );
}
