import { expect, test } from "vitest";
import { FeedError, formatUpdated, loadFeeds, parseLunch, parseTrains } from "./feed";

const attribution = "Data: Transport for NSW Open Data, CC BY 4.0";

const trains = {
  updated: "2026-10-27T07:45:00+11:00",
  status: "disruptions",
  lines: [
    {
      line: "T1 North Shore & Western Line",
      summary: "Trains run less often between Hornsby and Berowra.",
    },
  ],
  more: 2,
  attribution,
};

const pick = (name: string) => ({
  name,
  kind: "restaurant",
  cuisine: "thai",
  distance_m: 340,
  street: "Example Road",
  lat: -33.879,
  lon: 151.2031,
  reason: "a sit-down lunch",
});

const lunch = {
  updated: "2026-10-27T11:30:00+11:00",
  place: "Sydney Masonic Centre",
  picks: [pick("A"), pick("B"), pick("C")],
  attribution: "Data: OpenStreetMap contributors, ODbL",
};

const answering = (bodies: Record<string, unknown>) => {
  return (async (url: string) => {
    return url in bodies
      ? new Response(JSON.stringify(bodies[url]), { status: 200 })
      : new Response("", { status: 404 });
  }) as unknown as typeof fetch;
};

test("parseTrains accepts a normal day with no lines", () => {
  const feed = parseTrains({ updated: "2026-10-28T00:32:00+11:00", status: "normal", lines: [], more: 0, attribution: "Data: Transport for NSW Open Data, CC BY 4.0" });
  expect(feed.status).toBe("normal");
});
test("parseTrains rejects an unknown status", () => {
  expect(() => parseTrains({ updated: "x", status: "late", lines: [], more: 0, attribution: "a" })).toThrow(/status/);
});
test("parseLunch rejects a pick without coordinates", () => {
  const pick = { name: "A", kind: "cafe", cuisine: "", distance_m: 120, street: "", reason: "quick" };
  expect(() => parseLunch({ updated: "x", place: "P", picks: [pick, pick, pick], attribution: "a" })).toThrow(/lat/);
});
test("parseLunch requires exactly three picks", () => {
  expect(() => parseLunch({ updated: "x", place: "P", picks: [], attribution: "a" })).toThrow(/three/);
});
test("loadFeeds reports a failed fetch", async () => {
  const failing = (async () => new Response("", { status: 404 })) as unknown as typeof fetch;
  const feeds = await loadFeeds("/", failing);
  expect(feeds.trains).toEqual({ ok: false, error: expect.stringContaining("404") });
});
test("formatUpdated renders Sydney time", () => {
  expect(formatUpdated("2026-10-28T00:32:00Z")).toMatch(/11:32/);
});

test("parseTrains keeps the disruptions in the tool's order", () => {
  expect(parseTrains(trains)).toEqual(trains);
});

test("parseTrains keeps only the fields of the shape", () => {
  const feed = parseTrains({ ...trains, extra: "x", lines: [{ ...trains.lines[0], url: "u" }] });
  expect(feed).toEqual(trains);
});

test("parseTrains accepts any ISO 8601 offset", () => {
  ["2026-10-27T20:45:00Z", "2026-10-27T20:45:00+00:00", "2026-10-28T07:45:00+11:00"].forEach(
    (updated) => {
      expect(parseTrains({ ...trains, updated }).updated).toBe(updated);
    },
  );
});

test("parseTrains rejects an updated time that is not a date", () => {
  expect(() => parseTrains({ ...trains, updated: "soon" })).toThrow(/updated/);
});

test("parseTrains rejects a feed that is not an object", () => {
  expect(() => parseTrains(null)).toThrow(FeedError);
  expect(() => parseTrains([])).toThrow(/trains/);
});

test("parseTrains rejects lines that are not a list", () => {
  expect(() => parseTrains({ ...trains, lines: "none" })).toThrow(/lines/);
});

test("parseTrains names the line field that is missing", () => {
  const lines = [{ line: "T1" }];
  expect(() => parseTrains({ ...trains, lines })).toThrow(/lines\[0\]\.summary/);
});

test("parseTrains rejects a count of further updates that is not a whole number", () => {
  expect(() => parseTrains({ ...trains, more: 1.5 })).toThrow(/more/);
  expect(() => parseTrains({ ...trains, more: -1 })).toThrow(/more/);
});

test("parseTrains rejects a missing attribution", () => {
  expect(() => parseTrains({ ...trains, attribution: undefined })).toThrow(/attribution/);
});

test("parseLunch accepts three picks with their coordinates", () => {
  expect(parseLunch(lunch)).toEqual(lunch);
});

test("parseLunch rejects four picks", () => {
  expect(() => parseLunch({ ...lunch, picks: [...lunch.picks, pick("D")] })).toThrow(/three/);
});

test("parseLunch rejects a distance that is not a whole number of metres", () => {
  const picks = [pick("A"), { ...pick("B"), distance_m: 12.5 }, pick("C")];
  expect(() => parseLunch({ ...lunch, picks })).toThrow(/picks\[1\]\.distance_m/);
});

test("parseLunch rejects coordinates outside the globe", () => {
  const picks = [pick("A"), pick("B"), { ...pick("C"), lon: 200 }];
  expect(() => parseLunch({ ...lunch, picks })).toThrow(/picks\[2\]\.lon/);
});

test("parseLunch rejects a pick that is not an object", () => {
  expect(() => parseLunch({ ...lunch, picks: [pick("A"), "B", pick("C")] })).toThrow(/picks\[1\]/);
});

test("parseLunch rejects an updated time that is not a date", () => {
  expect(() => parseLunch({ ...lunch, updated: "lunchtime" })).toThrow(/updated/);
});

test("loadFeeds fetches both files from the base without the cache", async () => {
  const requests: { url: string; cache?: RequestCache }[] = [];
  const recording = (async (url: string, init?: RequestInit) => {
    requests.push({ url, cache: init?.cache });
    return new Response(JSON.stringify(url.endsWith("trains.json") ? trains : lunch));
  }) as unknown as typeof fetch;
  const feeds = await loadFeeds("/planner/", recording);
  expect(feeds).toEqual({ trains: { ok: true, data: trains }, lunch: { ok: true, data: lunch } });
  expect(requests).toEqual([
    { url: "/planner/data/trains.json", cache: "no-store" },
    { url: "/planner/data/lunch.json", cache: "no-store" },
  ]);
});

test("loadFeeds reports a feed that does not parse and keeps the other", async () => {
  const feeds = await loadFeeds(
    "/",
    answering({ "/data/trains.json": trains, "/data/lunch.json": { ...lunch, picks: [] } }),
  );
  expect(feeds.trains.ok).toBe(true);
  expect(feeds.lunch).toEqual({ ok: false, error: expect.stringContaining("three") });
});

test("loadFeeds reports a network error", async () => {
  const offline = (async () => {
    throw new TypeError("Failed to fetch");
  }) as unknown as typeof fetch;
  const feeds = await loadFeeds("/", offline);
  expect(feeds.lunch).toEqual({ ok: false, error: expect.stringContaining("Failed to fetch") });
});

test("loadFeeds reports a rejection that is not an Error", async () => {
  const rejecting = (async () => Promise.reject("offline")) as unknown as typeof fetch;
  const feeds = await loadFeeds("/", rejecting);
  expect(feeds.trains).toEqual({ ok: false, error: "/data/trains.json: offline" });
});

test("loadFeeds reports a file that is not JSON", async () => {
  const garbled = (async () => new Response("<html>")) as unknown as typeof fetch;
  const feeds = await loadFeeds("/", garbled);
  expect(feeds.trains).toEqual({ ok: false, error: expect.stringContaining("trains.json") });
});

test("formatUpdated names the Sydney time zone", () => {
  expect(formatUpdated("2026-10-28T00:32:00Z")).toMatch(/AEDT/);
});
