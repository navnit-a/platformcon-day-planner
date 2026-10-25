import { expect, test } from "vitest";
import { dayStats, statLabels } from "./stats";

const session = (time: string, track: string) => ({ time, track, title: `${time} ${track}`, speakers: "" });

test("counts sessions, distinct rooms and the one day they run on", () => {
  const stats = dayStats([
    session("09:00", "Main Stage"),
    session("09:30", "Main Stage"),
    session("09:30", "Roundtables"),
    session("16:30", "Social"),
  ]);
  expect(stats).toEqual({ sessions: 4, rooms: 3, days: 1 });
});

test("does not count a session without a room as a room", () => {
  expect(dayStats([session("09:00", ""), session("10:00", "Main Stage")]).rooms).toBe(1);
});

test("an empty schedule has no sessions, rooms or days", () => {
  expect(dayStats([])).toEqual({ sessions: 0, rooms: 0, days: 0 });
});

test("words the stats in the singular or plural as the numbers need", () => {
  expect(statLabels({ sessions: 22, rooms: 5, days: 1 })).toEqual(["22 sessions", "5 rooms", "1 day"]);
  expect(statLabels({ sessions: 1, rooms: 1, days: 2 })).toEqual(["1 session", "1 room", "2 days"]);
});
