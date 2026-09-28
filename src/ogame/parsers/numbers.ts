/**
 * Parsing of numbers as displayed by OGame, independent of the game language.
 *
 * Two shapes exist:
 *  - full integers with thousands separators: "1.234.567", "1,234,567", "1 234 567"
 *    → OGame quantities are integers, so every separator is a thousands separator
 *      and groups must have exactly 3 digits (otherwise the text is ambiguous → null);
 *  - abbreviated values with a magnitude suffix: "240,998M", "2,889Md", "7.6Bn"
 *    → the LAST separator is the decimal mark (unless it repeats), the value is approximate.
 *
 * Never use parseFloat on OGame text: "1.234" would become 1.234 instead of 1234.
 */

export interface ParsedNumber {
  readonly value: number;
  /** True when the text was abbreviated (suffix), i.e. the exact value is unknown. */
  readonly approximate: boolean;
}

/**
 * Magnitude suffixes, lower-cased. Covers the main OGame languages; an unknown
 * suffix makes the parser return null rather than guess.
 */
const SUFFIX_MULTIPLIERS: Readonly<Partial<Record<string, number>>> = {
  k: 1e3,
  m: 1e6,
  mn: 1e6,
  mio: 1e6,
  md: 1e9,
  mrd: 1e9,
  mld: 1e9,
  b: 1e9,
  bn: 1e9,
  g: 1e9,
  t: 1e12,
  tn: 1e12,
  bio: 1e12,
};

// Regular, no-break and narrow no-break spaces, plus apostrophes used as group separators.
const GROUP_CHARS = /[\s\u00a0\u202f'\u2019]/g;
const NUMBER_PATTERN = /^([+\-\u2212]?)(\d[\d.,]*)(\p{L}*)$/u;

export function parseOGameNumberDetailed(text: string | null | undefined): ParsedNumber | null {
  if (text == null) return null;
  const compact = text.trim().replace(GROUP_CHARS, '');
  const match = NUMBER_PATTERN.exec(compact);
  if (!match) return null;

  const sign = match[1] ?? '';
  const digits = match[2] ?? '';
  const suffix = match[3] ?? '';
  const negative = sign === '-' || sign === '\u2212';

  if (suffix === '') {
    const integer = parseGroupedInteger(digits);
    if (integer === null) return null;
    return { value: negative ? -integer : integer, approximate: false };
  }

  const multiplier = SUFFIX_MULTIPLIERS[suffix.toLowerCase()];
  if (multiplier === undefined) return null;
  const base = parseAbbreviatedBase(digits);
  if (base === null) return null;
  const value = Math.round(base * multiplier);
  return { value: negative ? -value : value, approximate: true };
}

/** Convenience wrapper returning only the numeric value. */
export function parseOGameNumber(text: string | null | undefined): number | null {
  return parseOGameNumberDetailed(text)?.value ?? null;
}

function parseGroupedInteger(digits: string): number | null {
  const [head, ...tail] = digits.split(/[.,]/);
  if (!head || (tail.length > 0 && head.length > 3)) return null;
  if (tail.some((group) => group.length !== 3)) return null;
  return Number(head + tail.join(''));
}

function parseAbbreviatedBase(digits: string): number | null {
  const lastSeparator = Math.max(digits.lastIndexOf('.'), digits.lastIndexOf(','));
  if (lastSeparator === -1) return Number(digits);

  const separator = digits.charAt(lastSeparator);
  if (digits.split(separator).length > 2) {
    // "1.234.567M": the repeated separator groups thousands.
    return parseGroupedInteger(digits);
  }
  const integerPart = digits.slice(0, lastSeparator);
  const fraction = digits.slice(lastSeparator + 1);
  if (fraction === '' || !/^\d+$/.test(fraction)) return null;
  const integer = parseGroupedInteger(integerPart);
  if (integer === null) return null;
  return Number(`${integer}.${fraction}`);
}
