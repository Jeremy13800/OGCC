// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import fixture from '../__fixtures__/head-meta.synthetic.html?raw';
import { readOGameMeta } from './meta';

const parse = (html: string) => new DOMParser().parseFromString(html, 'text/html');

describe('readOGameMeta (synthetic fixture)', () => {
  it('reads present tags and omits empty ones', () => {
    const meta = readOGameMeta(parse(fixture));
    expect(meta).toMatchObject({
      universe: 's999-fr.ogame.gameforge.com',
      playerName: 'TestPlayer',
      planetCoordinates: '1:1:8',
    });
    expect(meta).not.toHaveProperty('version');
    expect(meta).not.toHaveProperty('timestamp');
  });

  it('returns an empty object on a page without OGame meta tags', () => {
    expect(readOGameMeta(parse('<html><head></head><body></body></html>'))).toEqual({});
  });
});
