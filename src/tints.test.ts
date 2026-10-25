import { expect, test } from "vitest";
import { trackTint } from "./tints";

const tracks = ["Main Stage", "Roundtables", "Workshop Room 1", "Workshop Room 2", "Social"];

test("gives each track its own tint in track order", () => {
  expect(tracks.map((track) => trackTint(track, tracks))).toEqual([1, 2, 3, 4, 5]);
});

test("keeps a track's tint whatever else is on screen", () => {
  expect(trackTint("Social", tracks)).toBe(trackTint("Social", [...tracks]));
  expect(trackTint("Workshop Room 1", tracks)).toBe(3);
});

test("starts the tints again after the fifth track", () => {
  expect(trackTint("Sixth", [...tracks, "Sixth"])).toBe(1);
});

test("gives an unknown track the neutral tint", () => {
  expect(trackTint("", tracks)).toBe(0);
});
