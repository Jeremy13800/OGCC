import type { Coordinates } from '@/domain/coordinates';

const COORDINATES_PATTERN = /^\[?\s*(\d{1,2})\s*:\s*(\d{1,3})\s*:\s*(\d{1,2})\s*\]?$/;

/** Parses "[1:234:5]" (brackets optional). Returns null for anything that is not valid coordinates. */
export function parseCoordinates(text: string | null | undefined): Coordinates | null {
  if (!text) return null;
  const match = COORDINATES_PATTERN.exec(text.trim());
  if (!match) return null;
  const galaxy = Number(match[1]);
  const system = Number(match[2]);
  const position = Number(match[3]);
  if (galaxy < 1 || system < 1 || position < 1 || position > 16) return null;
  return { galaxy, system, position };
}
