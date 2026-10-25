import { expect, test } from "vitest";
import { glanceDots, glanceSummary, hourTicks, positionOf, toMinutes } from "./timeline";

const session = (time: string, track = "Main Stage") => ({ time, track, title: `${time} ${track}`, speakers: "" });

test("reads a start time as minutes after midnight", () => {
  expect(toMinutes("09:00")).toBe(540);
  expect(toMinutes("18:30")).toBe(1110);
});

test("places a time between the first and last start of the day", () => {
  expect(positionOf("09:00", "09:00", "18:30")).toBe(0);
  expect(positionOf("18:30", "09:00", "18:30")).toBe(1);
  expect(positionOf("13:45", "09:00", "18:30")).toBe(0.5);
});

test("places every time at the start when the day has a single start time", () => {
  expect(positionOf("09:00", "09:00", "09:00")).toBe(0);
});

test("labels every whole hour from the first start to the last", () => {
  expect(hourTicks("09:00", "18:30").map((tick) => tick.label)).toEqual([
    "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00",
  ]);
  expect(hourTicks("09:00", "18:30")[1].position).toBeCloseTo(60 / 570);
  expect(hourTicks("09:30", "11:00").map((tick) => tick.label)).toEqual(["10:00", "11:00"]);
});

test("gives one dot per session, stacking the dots of sessions that start together", () => {
  const dots = glanceDots([
    session("10:00"),
    session("09:00"),
    session("10:00", "Roundtables"),
    session("10:00", "Social"),
  ]);
  expect(dots.map((dot) => [dot.time, dot.track, dot.stack])).toEqual([
    ["09:00", "Main Stage", 0],
    ["10:00", "Main Stage", 0],
    ["10:00", "Roundtables", 1],
    ["10:00", "Social", 2],
  ]);
  expect(dots.map((dot) => dot.position)).toEqual([0, 1, 1, 1]);
});

test("has no dots for an empty day", () => {
  expect(glanceDots([])).toEqual([]);
});

test("sums the day up in words for assistive tech", () => {
  expect(glanceSummary([session("18:30"), session("09:00"), session("09:30")])).toBe(
    "Day at a glance: 3 sessions from 09:00 to 18:30",
  );
  expect(glanceSummary([])).toBe("Day at a glance: no sessions");
});
