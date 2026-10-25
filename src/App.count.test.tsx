import { render, screen, within } from "@testing-library/react";
import { expect, test, vi } from "vitest";

vi.mock("./data/schedule.json", () => ({
  default: [
    { time: "09:00", track: "Main Stage", title: "One", speakers: "A" },
    { time: "10:00", track: "Main Stage", title: "Two", speakers: "B" },
    { time: "11:00", track: "Main Stage", title: "Three", speakers: "C" },
  ],
}));

test("counts the sessions from the schedule data", async () => {
  const { default: App } = await import("./App");
  render(<App />);
  expect(within(screen.getByRole("banner")).getByText("3 sessions")).toBeInTheDocument();
});
