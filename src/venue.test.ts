import { expect, test } from "vitest";
import { STATIONS, VENUE, venueLines } from "./venue";

test("the venue is the Sydney Masonic Centre on Goulburn Street", () => {
  expect(VENUE).toEqual({
    name: "Sydney Masonic Centre",
    address: "66 Goulburn Street, Sydney",
    lat: -33.8781,
    lon: 151.2077,
  });
});

test("Museum is the nearest station, on the City Circle lines", () => {
  expect(STATIONS[0]).toEqual({ name: "Museum", lines: ["T2", "T3", "T8"], walkMinutes: 4 });
});

test("stations are listed nearest first", () => {
  const minutes = STATIONS.map((station) => station.walkMinutes);
  expect(minutes).toEqual([...minutes].sort((a, b) => a - b));
});

test("venueLines lists each line once", () => {
  expect(new Set(venueLines()).size).toBe(venueLines().length);
  expect(venueLines()).toContain("T2");
});

test("venueLines keeps the order the stations give", () => {
  expect(venueLines().slice(0, 3)).toEqual(["T2", "T3", "T8"]);
});
