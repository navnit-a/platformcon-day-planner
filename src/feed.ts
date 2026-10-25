export type TrainLine = { line: string; summary: string };

export type TrainsFeed = {
  updated: string;
  status: "normal" | "disruptions";
  lines: TrainLine[];
  more: number;
  attribution: string;
};

export type LunchPick = {
  name: string;
  kind: string;
  cuisine: string;
  distance_m: number;
  street: string;
  lat: number;
  lon: number;
  reason: string;
};

export type LunchFeed = { updated: string; place: string; picks: LunchPick[]; attribution: string };

export type FeedResult<T> = { ok: true; data: T } | { ok: false; error: string };

export class FeedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FeedError";
  }
}

type Fields = Record<string, unknown>;

const TRAIN_STATUSES = ["normal", "disruptions"] as const;
const LUNCH_PICKS = 3;

const SYDNEY_TIME = new Intl.DateTimeFormat("en-AU", {
  timeZone: "Australia/Sydney",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
  timeZoneName: "short",
});

const fail = (message: string): never => {
  throw new FeedError(message);
};

const isText = (value: unknown): value is string => {
  return typeof value === "string";
};

const isWholeCount = (value: unknown): value is number => {
  return Number.isInteger(value) && (value as number) >= 0;
};

const isWithin = (limit: number) => {
  return (value: unknown): value is number => {
    return typeof value === "number" && Number.isFinite(value) && Math.abs(value) <= limit;
  };
};

const isLatitude = isWithin(90);
const isLongitude = isWithin(180);

const isTrainStatus = (value: unknown): value is TrainsFeed["status"] => {
  return TRAIN_STATUSES.some((status) => status === value);
};

const record = (value: unknown, where: string): Fields => {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return fail(`${where} must be an object`);
  }
  return value as Fields;
};

const field = <T>(
  fields: Fields,
  name: string,
  where: string,
  accepts: (value: unknown) => value is T,
  expected: string,
): T => {
  const value = fields[name];
  return accepts(value) ? value : fail(`${where}.${name} must be ${expected}`);
};

const list = (fields: Fields, name: string, where: string): unknown[] => {
  const value = fields[name];
  return Array.isArray(value) ? value : fail(`${where}.${name} must be a list`);
};

const timestamp = (fields: Fields, where: string): string => {
  const updated = field(fields, "updated", where, isText, "a string");
  return Number.isFinite(Date.parse(updated))
    ? updated
    : fail(`${where}.updated must be an ISO 8601 time, got "${updated}"`);
};

const parseLine = (value: unknown, where: string): TrainLine => {
  const fields = record(value, where);
  return {
    line: field(fields, "line", where, isText, "a string"),
    summary: field(fields, "summary", where, isText, "a string"),
  };
};

const parsePick = (value: unknown, where: string): LunchPick => {
  const fields = record(value, where);
  return {
    name: field(fields, "name", where, isText, "a string"),
    kind: field(fields, "kind", where, isText, "a string"),
    cuisine: field(fields, "cuisine", where, isText, "a string"),
    distance_m: field(fields, "distance_m", where, isWholeCount, "a whole number of metres"),
    street: field(fields, "street", where, isText, "a string"),
    lat: field(fields, "lat", where, isLatitude, "a latitude"),
    lon: field(fields, "lon", where, isLongitude, "a longitude"),
    reason: field(fields, "reason", where, isText, "a string"),
  };
};

const threePicks = (fields: Fields, where: string): unknown[] => {
  const picks = list(fields, "picks", where);
  return picks.length === LUNCH_PICKS
    ? picks
    : fail(`${where}.picks must hold exactly three places, got ${picks.length}`);
};

export const parseTrains = (value: unknown): TrainsFeed => {
  const where = "trains";
  const fields = record(value, where);
  const feed = {
    status: field(fields, "status", where, isTrainStatus, `one of ${TRAIN_STATUSES.join(", ")}`),
    lines: list(fields, "lines", where).map((line, index) => {
      return parseLine(line, `${where}.lines[${index}]`);
    }),
    more: field(fields, "more", where, isWholeCount, "a whole number"),
    attribution: field(fields, "attribution", where, isText, "a string"),
  };
  return { updated: timestamp(fields, where), ...feed };
};

export const parseLunch = (value: unknown): LunchFeed => {
  const where = "lunch";
  const fields = record(value, where);
  const feed = {
    place: field(fields, "place", where, isText, "a string"),
    picks: threePicks(fields, where).map((pick, index) => {
      return parsePick(pick, `${where}.picks[${index}]`);
    }),
    attribution: field(fields, "attribution", where, isText, "a string"),
  };
  return { updated: timestamp(fields, where), ...feed };
};

const reason = (error: unknown): string => {
  return error instanceof Error ? error.message : String(error);
};

const fetchFeed = async <T>(
  url: string,
  parse: (value: unknown) => T,
  fetchImpl: typeof fetch,
): Promise<FeedResult<T>> => {
  try {
    const response = await fetchImpl(url, { cache: "no-store" });
    if (!response.ok) {
      return { ok: false, error: `${url} answered HTTP ${response.status}` };
    }
    return { ok: true, data: parse(await response.json()) };
  } catch (error) {
    return { ok: false, error: `${url}: ${reason(error)}` };
  }
};

export const loadFeeds = async (
  base: string,
  fetchImpl: typeof fetch = fetch,
): Promise<{ trains: FeedResult<TrainsFeed>; lunch: FeedResult<LunchFeed> }> => {
  const [trains, lunch] = await Promise.all([
    fetchFeed(`${base}data/trains.json`, parseTrains, fetchImpl),
    fetchFeed(`${base}data/lunch.json`, parseLunch, fetchImpl),
  ]);
  return { trains, lunch };
};

export const formatUpdated = (iso: string): string => {
  const time = new Date(iso);
  return Number.isFinite(time.getTime()) ? SYDNEY_TIME.format(time) : iso;
};
