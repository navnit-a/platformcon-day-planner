import { render, screen, within } from "@testing-library/react";
import { expect, test } from "vitest";
import App from "./App";

test("sums up the day in the header as sessions, rooms and days", () => {
  render(<App />);
  const header = screen.getByRole("banner");
  expect(within(header).getByText("22 sessions")).toBeInTheDocument();
  expect(within(header).getByText("5 rooms")).toBeInTheDocument();
  expect(within(header).getByText("1 day")).toBeInTheDocument();
});

test("shows the day at a glance with a summary a screen reader can read", () => {
  render(<App />);
  expect(
    screen.getByRole("img", { name: "Day at a glance: 22 sessions from 09:00 to 18:30" }),
  ).toBeInTheDocument();
});

test("marks the opening Main Stage session as the one that opens the day", () => {
  render(<App />);
  const marked = screen
    .getAllByRole("article")
    .filter((article) => within(article).queryByText("Opens the day"));
  expect(marked).toHaveLength(1);
  expect(within(marked[0]).getByRole("heading", { level: 2 })).toHaveTextContent(
    "Thinking in platforms",
  );
});
