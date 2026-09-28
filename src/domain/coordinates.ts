/** Position of a celestial body: [galaxy:system:position]. Position 16 is the expedition slot. */
export interface Coordinates {
  readonly galaxy: number;
  readonly system: number;
  readonly position: number;
}

export function formatCoordinates({ galaxy, system, position }: Coordinates): string {
  return `[${galaxy}:${system}:${position}]`;
}
