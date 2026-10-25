import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";
import App from "./App";

const rooms = ["Main Stage", "Workshop Room 1", "Workshop Room 2", "Roundtables"];

async function openRooms() {
  render(<App />);
  await userEvent.click(screen.getByRole("button", { name: "Rooms" }));
}

test("choosing Rooms replaces the schedule with the room guide", async () => {
  await openRooms();
  expect(screen.getByRole("button", { name: "Rooms" })).toHaveAttribute("aria-pressed", "true");
  expect(screen.getByRole("region", { name: "Rooms" })).toBeInTheDocument();
  expect(screen.queryByRole("region", { name: "Schedule" })).not.toBeInTheDocument();
});

test("shows each room as a heading and leaves Social out", async () => {
  await openRooms();
  const headings = screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent);
  expect(headings).toEqual(rooms);
});

test("lists a room's sessions in start-time order with time and title", async () => {
  await openRooms();
  const room = screen.getByRole("group", { name: "Workshop Room 1" });
  const items = within(room).getAllByRole("listitem");
  expect(items).toHaveLength(5);
  const times = items.map((item) => within(item).getByText(/^\d\d:\d\d$/).textContent);
  expect(times).toEqual([...times].sort());
  expect(
    within(items[0]).getByRole("button", {
      name: /Your agent will crash mid-task: Durable agent orchestration lab/,
    }),
  ).toBeInTheDocument();
});

test("opening a session from the room guide shows its room", async () => {
  await openRooms();
  const room = screen.getByRole("group", { name: "Roundtables" });
  await userEvent.click(within(room).getAllByRole("button")[0]);
  const dialog = screen.getByRole("dialog");
  expect(within(dialog).getByText("Roundtables")).toBeInTheDocument();
});

test("the view switch is reachable by keyboard and returns to the schedule", async () => {
  render(<App />);
  const schedule = screen.getByRole("button", { name: "Schedule" });
  const roomsButton = screen.getByRole("button", { name: "Rooms" });
  roomsButton.focus();
  await userEvent.keyboard("{Enter}");
  expect(roomsButton).toHaveFocus();
  schedule.focus();
  await userEvent.keyboard("{Enter}");
  expect(screen.getByRole("region", { name: "Schedule" })).toBeInTheDocument();
});

test("Tab moves through the room sessions in order and Shift+Tab leaves back to the switch", async () => {
  await openRooms();
  const roomsButton = screen.getByRole("button", { name: "Rooms" });
  roomsButton.focus();
  await userEvent.tab();
  const group = screen.getByRole("group", { name: "Main Stage" });
  const buttons = within(group).getAllByRole("button");
  expect(buttons[0]).toHaveFocus();
  await userEvent.tab();
  expect(buttons[1]).toHaveFocus();
  await userEvent.tab({ shift: true });
  await userEvent.tab({ shift: true });
  expect(roomsButton).toHaveFocus();
});
