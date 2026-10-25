import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, test } from "vitest";
import App from "./App";

const FIRST = "Thinking in platforms: Thrive in the agentic era";

function secondTitle(): string {
  const stars = screen.getAllByRole("button", { name: /^Star / });
  return stars[1].getAttribute("aria-label")!.replace(/^Star /, "");
}

beforeEach(() => {
  localStorage.clear();
});

test("two starred sessions are still starred and in my agenda after reopening", async () => {
  const user = userEvent.setup();
  const first = render(<App />);
  const second = secondTitle();
  await user.click(screen.getByRole("button", { name: `Star ${FIRST}` }));
  await user.click(screen.getByRole("button", { name: `Star ${second}` }));
  first.unmount();
  render(<App />);
  expect(screen.getByRole("button", { name: `Unstar ${FIRST}` })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: `Unstar ${second}` })).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: /My agenda/ }));
  const agenda = screen.getByRole("region", { name: "My agenda" });
  expect(within(agenda).getByText(FIRST)).toBeInTheDocument();
  expect(within(agenda).getByText(second)).toBeInTheDocument();
});

test("a session I unstarred stays unstarred and out of my agenda after reopening", async () => {
  const user = userEvent.setup();
  const first = render(<App />);
  await user.click(screen.getByRole("button", { name: `Star ${FIRST}` }));
  await user.click(screen.getByRole("button", { name: `Unstar ${FIRST}` }));
  first.unmount();
  render(<App />);
  expect(screen.getByRole("button", { name: `Star ${FIRST}` })).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  await user.click(screen.getByRole("button", { name: /My agenda/ }));
  expect(screen.getByText("Star sessions on the schedule to build your plan.")).toBeInTheDocument();
});

test("a first visit shows an empty agenda and never asks me to sign in", async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByRole("button", { name: /My agenda/ }));
  expect(screen.getByText("Star sessions on the schedule to build your plan.")).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: /sign in|log in|account/i })).not.toBeInTheDocument();
  expect(screen.queryByRole("link", { name: /sign in|log in|account/i })).not.toBeInTheDocument();
  expect(screen.queryByLabelText(/password|email/i)).not.toBeInTheDocument();
});
