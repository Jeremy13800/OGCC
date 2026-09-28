/**
 * Single source of truth for every OGame DOM selector used by OGCC.
 *
 * Rules (see AGENTS.md and docs/ogame-dom.md):
 *  - no selector may be written outside this file;
 *  - prefer ids, data-* attributes and meta tags over structural paths (no nth-child chains);
 *  - never rely on translated text;
 *  - every entry is marked VERIFIED (confirmed on a real page, with the date) or UNVERIFIED.
 */
export const ogameSelectors = {
  /**
   * <meta name="ogame-*"> tags exposed in the game <head>.
   * UNVERIFIED — names documented by the community tooling ecosystem; to confirm with the
   * real <head> during Phase 1. Consumers must tolerate every one of them being absent.
   */
  meta: {
    universeName: 'meta[name="ogame-universe-name"]',
    universe: 'meta[name="ogame-universe"]',
    language: 'meta[name="ogame-language"]',
    version: 'meta[name="ogame-version"]',
    timestamp: 'meta[name="ogame-timestamp"]',
    playerId: 'meta[name="ogame-player-id"]',
    playerName: 'meta[name="ogame-player-name"]',
    planetId: 'meta[name="ogame-planet-id"]',
    planetName: 'meta[name="ogame-planet-name"]',
    planetCoordinates: 'meta[name="ogame-planet-coordinates"]',
    planetType: 'meta[name="ogame-planet-type"]',
  },
} as const;

export type OGameMetaKey = keyof typeof ogameSelectors.meta;
