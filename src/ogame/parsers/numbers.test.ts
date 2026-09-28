import { describe, expect, it } from 'vitest';
import { parseOGameNumber, parseOGameNumberDetailed } from './numbers';

describe('parseOGameNumber', () => {
  describe('full integers', () => {
    it.each([
      ['0', 0],
      ['42', 42],
      ['1.234', 1234],
      ['1,234', 1234],
      ['1.234.567', 1234567],
      ['1,234,567', 1234567],
      ['1 234 567', 1234567],
      ['1\u00a0234\u00a0567', 1234567],
      ['1\u202f234', 1234],
      ["1'234'567", 1234567],
      ['-1.500', -1500],
      ['\u22121.500', -1500],
      ['+12.000', 12000],
      ['  240.998.123  ', 240998123],
    ])('%s → %d', (input, expected) => {
      expect(parseOGameNumber(input)).toBe(expected);
    });

    it('flags them as exact', () => {
      expect(parseOGameNumberDetailed('1.234')).toEqual({ value: 1234, approximate: false });
    });
  });

  describe('abbreviated values', () => {
    it.each([
      ['240,998M', 240_998_000],
      ['7,601M', 7_601_000],
      ['106,463M', 106_463_000],
      ['2,889Md', 2_889_000_000],
      ['240.998M', 240_998_000],
      ['2.889Bn', 2_889_000_000],
      ['1,5Mrd', 1_500_000_000],
      ['12k', 12_000],
      ['3M', 3_000_000],
      ['3 M', 3_000_000],
      ['1.234.567M', 1_234_567_000_000],
      ['1.234,5M', 1_234_500_000],
      ['-4,2M', -4_200_000],
    ])('%s → %d', (input, expected) => {
      expect(parseOGameNumber(input)).toBe(expected);
    });

    it('flags them as approximate', () => {
      expect(parseOGameNumberDetailed('240,998M')?.approximate).toBe(true);
    });
  });

  describe('invalid or ambiguous input', () => {
    it.each([
      [''],
      ['   '],
      ['abc'],
      ['1,5'], // decimal without suffix: OGame quantities are integers → ambiguous
      ['12.34'],
      ['1234.567'],
      ['1234.567.89'],
      ['12XYZ'], // unknown suffix
      ['1,M'],
      ['1..234'],
      ['12.34.5M'],
    ])('%s → null', (input) => {
      expect(parseOGameNumber(input)).toBeNull();
    });

    it('handles null and undefined', () => {
      expect(parseOGameNumber(null)).toBeNull();
      expect(parseOGameNumber(undefined)).toBeNull();
    });
  });
});
