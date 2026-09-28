import { describe, expect, it } from 'vitest';
import { formatCoordinates } from '@/domain/coordinates';
import { parseCoordinates } from './coordinates';

describe('parseCoordinates', () => {
  it.each([
    ['[1:234:5]', { galaxy: 1, system: 234, position: 5 }],
    ['4:499:16', { galaxy: 4, system: 499, position: 16 }],
    ['  [ 2 : 17 : 8 ]  ', { galaxy: 2, system: 17, position: 8 }],
  ])('parses %s', (input, expected) => {
    expect(parseCoordinates(input)).toEqual(expected);
  });

  it.each(['', '[1:2]', '[0:1:1]', '[1:1:17]', '[a:b:c]', '[1:2:3:4]', null, undefined])(
    'rejects %s',
    (input) => {
      expect(parseCoordinates(input)).toBeNull();
    },
  );

  it('round-trips with formatCoordinates', () => {
    const coords = { galaxy: 3, system: 120, position: 9 };
    expect(parseCoordinates(formatCoordinates(coords))).toEqual(coords);
  });
});
