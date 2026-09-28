import { describe, expect, it } from 'vitest';
import { DAY, HOUR, MINUTE, SECOND, formatDuration, remainingMs } from './time';

describe('formatDuration', () => {
  it.each([
    [0, '0s'],
    [999, '0s'],
    [42 * SECOND, '42s'],
    [5 * MINUTE + 3 * SECOND, '5min 3s'],
    [DAY + 19 * HOUR + 12 * MINUTE, '1j 19h'],
    [DAY + 12 * MINUTE, '1j 12min'],
    [3 * DAY, '3j'],
  ])('%d ms → %s', (ms, expected) => {
    expect(formatDuration(ms)).toBe(expected);
  });

  it('honours maxUnits', () => {
    expect(formatDuration(DAY + 2 * HOUR + 3 * MINUTE + 4 * SECOND, 4)).toBe('1j 2h 3min 4s');
    expect(formatDuration(DAY + 2 * HOUR, 1)).toBe('1j');
  });

  it.each([Number.NaN, Number.POSITIVE_INFINITY, -1])('rejects %d', (ms) => {
    expect(formatDuration(ms)).toBeNull();
  });
});

describe('remainingMs', () => {
  it('never goes below zero', () => {
    expect(remainingMs(1000, 400)).toBe(600);
    expect(remainingMs(1000, 5000)).toBe(0);
  });
});
