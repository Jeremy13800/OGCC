/**
 * Detects which OGame page is displayed, from the URL only (no DOM access).
 *
 * Game URLs look like:
 *   https://s{number}-{lang}.ogame.gameforge.com/game/index.php?page=ingame&component=overview
 * See docs/ogame-dom.md — component names are to be confirmed on real pages.
 */

export interface OGameServer {
  /** Full hostname, e.g. "s123-fr.ogame.gameforge.com". Stable key for per-universe data. */
  readonly host: string;
  readonly number: number;
  /** Community/language code from the hostname, e.g. "fr", "en", "de". */
  readonly community: string;
}

/** Views OGCC knows about. Anything else is reported as 'unknown' with the raw component kept. */
export const KNOWN_VIEWS = [
  'overview',
  'supplies',
  'facilities',
  'lfbuildings',
  'lfresearch',
  'research',
  'shipyard',
  'defenses',
  'fleetdispatch',
  'movement',
  'galaxy',
  'empire',
  'alliance',
  'messages',
  'highscore',
] as const;

export type OGameView = (typeof KNOWN_VIEWS)[number] | 'unknown';

export type OGamePageKind =
  /** Main game frame (page=ingame). */
  | 'ingame'
  /** Stand-alone popup windows (page=standalone), e.g. the empire view. */
  | 'standalone'
  /** Any other /game/ page OGCC does not categorise yet. */
  | 'other';

export interface OGamePageContext {
  readonly server: OGameServer;
  readonly kind: OGamePageKind;
  readonly view: OGameView;
  /** Raw `component` (or legacy `page`) query value, kept for diagnostics. */
  readonly rawView: string | null;
}

const GAME_HOST_PATTERN = /^s(\d+)-([a-z]{2,3})\.ogame\.gameforge\.com$/;

export function parseOGameServer(hostname: string): OGameServer | null {
  const match = GAME_HOST_PATTERN.exec(hostname.toLowerCase());
  if (!match) return null;
  return { host: match[0], number: Number(match[1]), community: match[2] ?? '' };
}

export function detectOGamePage(href: string): OGamePageContext | null {
  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return null;
  }
  if (url.protocol !== 'https:' || !url.pathname.startsWith('/game/')) return null;

  const server = parseOGameServer(url.hostname);
  if (!server) return null;

  const page = url.searchParams.get('page');
  const component = url.searchParams.get('component');
  const kind: OGamePageKind =
    page === 'ingame' ? 'ingame' : page === 'standalone' ? 'standalone' : 'other';
  // Older game versions used page=<view> directly.
  const rawView = component ?? (kind === 'other' ? page : null);

  return { server, kind, view: toView(rawView), rawView };
}

/** OGCC mounts its UI only in the main game window, never in popups or AJAX responses. */
export function shouldMountOn(context: OGamePageContext, href: string): boolean {
  if (context.kind === 'standalone') return false;
  try {
    return new URL(href).searchParams.get('ajax') !== '1';
  } catch {
    return false;
  }
}

function toView(raw: string | null): OGameView {
  if (raw === null) return 'unknown';
  const lowered = raw.toLowerCase();
  return (KNOWN_VIEWS as readonly string[]).includes(lowered) ? (lowered as OGameView) : 'unknown';
}
