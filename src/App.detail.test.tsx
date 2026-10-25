import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";
import App from "./App";
import SessionDetail from "./SessionDetail";

const swarm = "Swarm engineering: What swarms mean for platform engineers";
const security =
  "Who's watching the agents? Security and observability when AI ships the code";

test("tapping a session opens its title, speakers, room and time together", async () => {
  render(<App />);
  await userEvent.click(screen.getByRole("button", { name: swarm }));
  const dialog = screen.getByRole("dialog", { name: swarm });
  expect(within(dialog).getByText("Brendan Hopper, CBA")).toBeInTheDocument();
  expect(within(dialog).getByText("Main Stage")).toBeInTheDocument();
  expect(within(dialog).getByText("09:30")).toBeInTheDocument();
  expect(within(dialog).getByText("Starts")).toBeInTheDocument();
  expect(within(dialog).queryByText("Ends")).not.toBeInTheDocument();
});

test("lists every speaker of a multi-speaker session by name", async () => {
  render(<App />);
  await userEvent.click(screen.getByRole("button", { name: security }));
  const dialog = screen.getByRole("dialog", { name: security });
  const speakers = within(dialog).getAllByRole("listitem");
  expect(speakers.length).toBeGreaterThan(1);
  expect(within(dialog).getByText("Liz Fong-Jones, honeycomb.io")).toBeInTheDocument();
  expect(within(dialog).getByText("James Jarvis, ClearRoute")).toBeInTheDocument();
});

test("closing the detail leaves the schedule in place and focus on the tapped session", async () => {
  render(<App />);
  const before = screen.getAllByRole("article").length;
  const opener = screen.getByRole("button", { name: swarm });
  await userEvent.click(opener);
  await userEvent.click(screen.getByRole("button", { name: "Close" }));
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(screen.getAllByRole("article")).toHaveLength(before);
  expect(opener).toHaveFocus();
});

test("closes with the Escape key", async () => {
  render(<App />);
  await userEvent.click(screen.getByRole("button", { name: swarm }));
  await userEvent.keyboard("{Escape}");
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});

test("reads To be confirmed for a missing room and speaker", () => {
  render(
    <SessionDetail
      session={{ time: "16:30", track: "", title: "Booth crawl", speakers: "" }}
      onClose={() => {}}
    />,
  );
  const dialog = screen.getByRole("dialog", { name: "Booth crawl" });
  expect(within(dialog).getAllByText("To be confirmed")).toHaveLength(2);
});
