export type Station = { name: string; lines: readonly string[]; walkMinutes: number };

export const VENUE = {
  name: "Sydney Masonic Centre",
  address: "66 Goulburn Street, Sydney",
  lat: -33.8781,
  lon: 151.209,
} as const;

export const STATIONS: readonly Station[] = [
  { name: "Museum", lines: ["T2", "T3", "T8"], walkMinutes: 3 },
  { name: "Central", lines: ["T1", "T2", "T3", "T4", "T8", "T9"], walkMinutes: 9 },
];

export const venueLines = (): string[] => {
  return [...new Set(STATIONS.flatMap((station) => station.lines))];
};
