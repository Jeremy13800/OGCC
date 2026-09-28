import { describe, expect, it } from 'vitest';
import { detectOGamePage, parseOGameServer, shouldMountOn } from './page-detector';

const BASE = 'https://s123-fr.ogame.gameforge.com/game/index.php';

describe('parseOGameServer', () => {
  it('extracts universe number and community', () => {
    expect(parseOGameServer('s123-fr.ogame.gameforge.com')).toEqual({
      host: 's123-fr.ogame.gameforge.com',
      number: 123,
      community: 'fr',
    });
  });

  it.each(['lobby.ogame.gameforge.com', 'ogame.gameforge.com', 's1-fr.ogame.example.com', 'example.com'])(
    'rejects %s',
    (host) => {
      expect(parseOGameServer(host)).toBeNull();
    },
  );
});

describe('detectOGamePage', () => {
  it('detects an in-game component', () => {
    expect(detectOGamePage(`${BASE}?page=ingame&component=overview`)).toMatchObject({
      kind: 'ingame',
      view: 'overview',
      rawView: 'overview',
      server: { number: 123, community: 'fr' },
    });
  });

  it('keeps unknown components as raw values', () => {
    expect(detectOGamePage(`${BASE}?page=ingame&component=somethingNew`)).toMatchObject({
      kind: 'ingame',
      view: 'unknown',
      rawView: 'somethingNew',
    });
  });

  it('does not invent a view when the component is missing', () => {
    expect(detectOGamePage(`${BASE}?page=ingame`)).toMatchObject({ view: 'unknown', rawView: null });
  });

  it('supports the legacy page=<view> form', () => {
    expect(detectOGamePage(`${BASE}?page=galaxy`)).toMatchObject({ kind: 'other', view: 'galaxy' });
  });

  it('flags standalone windows', () => {
    expect(detectOGamePage(`${BASE}?page=standalone&component=empire`)).toMatchObject({
      kind: 'standalone',
      view: 'empire',
    });
  });

  it.each([
    'https://lobby.ogame.gameforge.com/fr_FR/hub',
    'https://s123-fr.ogame.gameforge.com/other/index.php',
    'http://s123-fr.ogame.gameforge.com/game/index.php',
    'not a url',
  ])('ignores %s', (href) => {
    expect(detectOGamePage(href)).toBeNull();
  });
});

describe('shouldMountOn', () => {
  const mountable = (href: string) => {
    const context = detectOGamePage(href);
    return context !== null && shouldMountOn(context, href);
  };

  it('mounts in the main game window', () => {
    expect(mountable(`${BASE}?page=ingame&component=overview`)).toBe(true);
  });

  it('skips standalone popups and AJAX documents', () => {
    expect(mountable(`${BASE}?page=standalone&component=empire`)).toBe(false);
    expect(mountable(`${BASE}?page=ingame&component=overview&ajax=1`)).toBe(false);
  });
});
