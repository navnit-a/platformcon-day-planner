import { render, screen, within } from "@testing-library/react";
import { expect, test } from "vitest";
import Schedule from "./Schedule";

const session = (time: string, title: string) => ({ time, title, track: "Main Stage", speakers: "" });

const sessions = [
  session("09:00", "Opening"),
  session("09:30", "Swarms"),
  session("09:30", "Roundtable"),
  session("10:00", "Agents"),
];

test("shows sessions that start together under one time heading, in time order", () => {
  render(<Schedule sessions={sessions} tracks={["Main Stage"]} onOpen={() => {}} />);
  const times = screen
    .getAllByRole("heading", { name: /^\d\d:\d\d$/ })
    .map((heading) => heading.textContent);
  expect(times).toEqual(["09:00", "09:30", "10:00"]);
  expect(screen.getAllByRole("heading", { name: "09:30" })).toHaveLength(1);
  const titles = within(screen.getByRole("group", { name: "09:30" }))
    .getAllByRole("article")
    .map((a) => within(a).getByRole("heading", { level: 2 }).textContent);
  expect(titles).toEqual(["Swarms", "Roundtable"]);
});
