export type Station = { name: string; lines: string[]; walkMinutes: number };

export const VENUE = {
  name: "Sydney Masonic Centre",
  address: "66 Goulburn Street, Sydney",
  lat: -33.8781,
  lon: 151.2077,
} as const;

export const STATIONS: readonly Station[] = [
  { name: "Museum", lines: ["T2", "T3", "T8"], walkMinutes: 4 },
  { name: "Central", lines: ["T1", "T2", "T3", "T4", "T8", "T9"], walkMinutes: 7 },
];

export const venueLines = (): string[] => {
  return [...new Set(STATIONS.flatMap((station) => station.lines))];
};
