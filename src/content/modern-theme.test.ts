// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { THEME_ATTRIBUTE, applyModernTheme } from './modern-theme';

describe('applyModernTheme', () => {
  it('is fully reversible', () => {
    const root = document.documentElement;
    const before = root.outerHTML;

    applyModernTheme(true);
    expect(root.getAttribute(THEME_ATTRIBUTE)).toBe('modern');

    applyModernTheme(false);
    expect(root.hasAttribute(THEME_ATTRIBUTE)).toBe(false);
    expect(root.outerHTML).toBe(before);
  });
});
