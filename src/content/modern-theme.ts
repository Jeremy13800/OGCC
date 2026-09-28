/**
 * Classic ↔ Modern switch for the OGame page itself.
 *
 * Phase 0: only toggles a namespaced marker attribute on <html>. Phase 1 will add a
 * stylesheet whose every rule is scoped under `html[data-ogcc-theme="modern"]`, so that
 * removing the attribute restores the original look immediately, without a reload.
 */

export const THEME_ATTRIBUTE = 'data-ogcc-theme';

export function applyModernTheme(enabled: boolean, doc: Document = document): void {
  const root = doc.documentElement;
  if (enabled) {
    root.setAttribute(THEME_ATTRIBUTE, 'modern');
  } else {
    root.removeAttribute(THEME_ATTRIBUTE);
  }
}
