import { render, screen, within } from "@testing-library/react";
import { expect, test } from "vitest";
import App from "./App";

test("shows the day's first session with its time, track and speaker", () => {
  render(<App />);
  expect(
    screen.getByRole("heading", { level: 1, name: "PlatformCon Day Planner" }),
  ).toBeInTheDocument();
  expect(screen.getByText("Wednesday 28 October 2026, Sydney Masonic Centre")).toBeInTheDocument();
  const first = screen.getAllByRole("article")[0];
  expect(within(first).getByText("09:00")).toBeInTheDocument();
  expect(within(first).getByRole("heading", { level: 2 })).toHaveTextContent(
    "Thinking in platforms",
  );
  expect(within(first).getByText("Main Stage")).toBeInTheDocument();
  expect(within(first).getByText("Luca Galante, Weave Intelligence")).toBeInTheDocument();
});

test("lists every published session in time order", () => {
  render(<App />);
  const times = screen.getAllByRole("article").map((a) => within(a).getByRole("time").textContent);
  expect(times).toHaveLength(22);
  expect([...times].sort()).toEqual(times);
});
