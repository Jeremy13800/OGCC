import { t } from './i18n';

/**
 * Time helpers. All durations are in milliseconds, all instants are epoch milliseconds.
 * Components must use these helpers instead of doing conversions inline.
 */

export const SECOND = 1000;
export const MINUTE = 60 * SECOND;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;

/** Remaining time until `target`, never negative. */
export function remainingMs(target: number, now: number = Date.now()): number {
  return Math.max(0, target - now);
}

/**
 * Formats a duration with at most `maxUnits` non-zero units, largest first:
 * 158_580_000 → "1j 20h". Returns null for invalid input (NaN, Infinity, negative).
 */
export function formatDuration(ms: number, maxUnits = 2): string | null {
  if (!Number.isFinite(ms) || ms < 0) return null;
  const units = [
    [DAY, t('time.day')],
    [HOUR, t('time.hour')],
    [MINUTE, t('time.minute')],
    [SECOND, t('time.second')],
  ] as const;

  let rest = ms;
  const parts: string[] = [];
  for (const [size, label] of units) {
    const amount = Math.floor(rest / size);
    rest -= amount * size;
    if (amount > 0) parts.push(`${amount}${label}`);
  }
  return parts.length > 0 ? parts.slice(0, maxUnits).join(' ') : `0${t('time.second')}`;
}
