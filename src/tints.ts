export const TINT_COUNT = 5;

export type Tint = 0 | 1 | 2 | 3 | 4 | 5;

export function trackTint(track: string, tracks: string[]): Tint {
  const index = tracks.indexOf(track);
  if (!track || index < 0) return 0;
  return ((index % TINT_COUNT) + 1) as Tint;
}
