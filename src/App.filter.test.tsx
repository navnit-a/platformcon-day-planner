import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";
import App from "./App";
import Schedule from "./Schedule";

const group = () => screen.getByRole("group", { name: "Filter by track" });

test("shows only the sessions of the chosen track", async () => {
  render(<App />);
  await userEvent.click(within(group()).getByRole("button", { name: "Roundtables" }));
  const articles = screen.getAllByRole("article");
  expect(articles.length).toBeLessThan(22);
  for (const a of articles) expect(within(a).getByText("Roundtables")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Roundtables" })).toHaveAttribute("aria-pressed", "true");
});

test("keeps time, title and room on each visible session", async () => {
  render(<App />);
  await userEvent.click(within(group()).getByRole("button", { name: "Roundtables" }));
  const first = screen.getAllByRole("article")[0];
  expect(within(first).getByText("09:30")).toBeInTheDocument();
  expect(within(first).getByRole("heading", { level: 2 })).toHaveTextContent(
    "Forming the AI platform engineering team",
  );
  expect(within(first).getByText("Roundtables")).toBeInTheDocument();
});

test("clearing the filter brings the full day back", async () => {
  render(<App />);
  await userEvent.click(within(group()).getByRole("button", { name: "Roundtables" }));
  await userEvent.click(screen.getByRole("button", { name: "Clear filter" }));
  expect(screen.getAllByRole("article")).toHaveLength(22);
});

test("choosing a different track replaces the previous one", async () => {
  render(<App />);
  await userEvent.click(within(group()).getByRole("button", { name: "Roundtables" }));
  await userEvent.click(within(group()).getByRole("button", { name: "Main Stage" }));
  const articles = screen.getAllByRole("article");
  for (const a of articles) expect(within(a).getByText("Main Stage")).toBeInTheDocument();
  expect(screen.queryByText("Forming the AI platform engineering team")).not.toBeInTheDocument();
});

test("says so when no sessions match the chosen track", async () => {
  render(<Schedule sessions={[]} tracks={["Lightning Talks"]} onOpen={() => {}} />);
  await userEvent.click(screen.getByRole("button", { name: "Lightning Talks" }));
  expect(screen.getByText("No sessions in this track.")).toBeInTheDocument();
  expect(screen.queryByRole("article")).not.toBeInTheDocument();
});
