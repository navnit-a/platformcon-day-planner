import { expect, test } from "vitest";
import { groupByTime } from "./slots";

const session = (time: string, title: string) => ({ time, title, track: "Main Stage", speakers: "" });

test("puts sessions that share a start time into one slot, slots in time order", () => {
  const slots = groupByTime([
    session("10:00", "Late"),
    session("09:30", "Second"),
    session("09:00", "First"),
    session("09:30", "Third"),
  ]);
  expect(slots.map((slot) => slot.time)).toEqual(["09:00", "09:30", "10:00"]);
  expect(slots[1].sessions.map((s) => s.title)).toEqual(["Second", "Third"]);
});

test("gives no slots for an empty day", () => {
  expect(groupByTime([])).toEqual([]);
});

test("leaves the sessions it was given untouched", () => {
  const sessions = [session("10:00", "Late"), session("09:00", "First")];
  groupByTime(sessions);
  expect(sessions.map((s) => s.title)).toEqual(["Late", "First"]);
});
