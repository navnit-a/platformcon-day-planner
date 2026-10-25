import { expect, test } from "vitest";
import { featuredSession } from "./featured";

const session = (time: string, track: string) => ({ time, track, title: `${time} ${track}`, speakers: "" });

test("features the first Main Stage session of the day", () => {
  const featured = featuredSession([
    session("09:30", "Main Stage"),
    session("09:00", "Roundtables"),
    session("09:15", "Main Stage"),
  ]);
  expect(featured?.title).toBe("09:15 Main Stage");
});

test("features nothing when no session is on the Main Stage", () => {
  expect(featuredSession([session("09:00", "Roundtables")])).toBeNull();
});
