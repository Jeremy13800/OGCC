import { describe, expect, it } from 'vitest';
import { t } from './index';

describe('t', () => {
  it('resolves nested keys', () => {
    expect(t('settings.modernUI')).toBe('Interface moderne');
  });

  it('interpolates parameters', () => {
    expect(t('status.storageOk', { version: 3 })).toBe('OK — schéma v3');
  });
});
