export type Pick = {
  name: string;
  kind: string;
  cuisine: string;
  distance_m: number;
  street: string;
  lat: number;
  lon: number;
  reason: string;
};

export type LunchData = {
  updated: string;
  place: string;
  picks: Pick[];
  attribution: string;
};

export const VENUE = { name: "Sydney Masonic Centre", street: "66 Goulburn Street", lat: -33.8781, lon: 151.209 };

const isText = (value: unknown): value is string => typeof value === "string";
const isNumber = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value);

const isPick = (value: unknown): value is Pick => {
  const pick = value as Pick;
  return (
    !!pick &&
    isText(pick.name) &&
    isText(pick.kind) &&
    isText(pick.cuisine) &&
    isNumber(pick.distance_m) &&
    isText(pick.street) &&
    isNumber(pick.lat) &&
    isNumber(pick.lon) &&
    isText(pick.reason)
  );
};

export function parseLunch(value: unknown): LunchData | null {
  const data = value as LunchData;
  if (!data || !isText(data.updated) || !isText(data.attribution) || !isText(data.place)) return null;
  if (Number.isNaN(Date.parse(data.updated))) return null;
  if (!Array.isArray(data.picks) || data.picks.length !== 3 || !data.picks.every(isPick)) return null;
  return data;
}

export async function loadLunch(): Promise<LunchData | null> {
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}data/lunch.json`, { cache: "no-store" });
    if (!response.ok) return null;
    return parseLunch(await response.json());
  } catch {
    return null;
  }
}

export const sydneyTime = (iso: string) =>
  new Intl.DateTimeFormat("en-AU", {
    timeZone: "Australia/Sydney",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(iso));
