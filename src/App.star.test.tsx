import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, test } from "vitest";
import App from "./App";

const TITLE = "Thinking in platforms: Thrive in the agentic era";

beforeEach(() => {
  localStorage.clear();
});

test("starring a session fills the star and adds it to my agenda", async () => {
  const user = userEvent.setup();
  render(<App />);
  const star = screen.getByRole("button", { name: `Star ${TITLE}` });
  expect(star).toHaveAttribute("aria-pressed", "false");
  await user.click(star);
  expect(screen.getByRole("button", { name: `Unstar ${TITLE}` })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await user.click(screen.getByRole("button", { name: /My agenda/ }));
  const agenda = screen.getByRole("region", { name: "My agenda" });
  expect(within(agenda).getByText(TITLE)).toBeInTheDocument();
});

test("tapping a filled star empties it and removes the session from my agenda", async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByRole("button", { name: `Star ${TITLE}` }));
  await user.click(screen.getByRole("button", { name: `Unstar ${TITLE}` }));
  expect(screen.getByRole("button", { name: `Star ${TITLE}` })).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  await user.click(screen.getByRole("button", { name: /My agenda/ }));
  const agenda = screen.getByRole("region", { name: "My agenda" });
  expect(within(agenda).queryByText(TITLE)).not.toBeInTheDocument();
});

test("starred sessions are still starred and in my agenda after reopening the app", async () => {
  const user = userEvent.setup();
  const first = render(<App />);
  await user.click(screen.getByRole("button", { name: `Star ${TITLE}` }));
  first.unmount();
  render(<App />);
  expect(screen.getByRole("button", { name: `Unstar ${TITLE}` })).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: /My agenda/ }));
  expect(
    within(screen.getByRole("region", { name: "My agenda" })).getByText(TITLE),
  ).toBeInTheDocument();
});

test("my agenda tells me to star sessions when none are starred", async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByRole("button", { name: /My agenda/ }));
  expect(screen.getByText("Star sessions on the schedule to build your plan.")).toBeInTheDocument();
});

test("unstarring from my agenda updates the schedule star", async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByRole("button", { name: `Star ${TITLE}` }));
  await user.click(screen.getByRole("button", { name: /My agenda/ }));
  await user.click(screen.getByRole("button", { name: `Unstar ${TITLE}` }));
  expect(screen.getByText("Star sessions on the schedule to build your plan.")).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Schedule" }));
  expect(screen.getByRole("button", { name: `Star ${TITLE}` })).toHaveAttribute(
    "aria-pressed",
    "false",
  );
});
