import { render, screen, within } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import App from "./App";

const respond = (body: unknown, ok = true) =>
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({ ok, json: async () => body })),
  );

const reject = () => vi.stubGlobal("fetch", vi.fn(async () => Promise.reject(new Error("offline"))));

afterEach(() => {
  vi.unstubAllGlobals();
});

const card = () => screen.getByRole("region", { name: "Getting there" });

test("shows Museum and Central with walk times and lines", async () => {
  respond({ updated: "2026-10-25T20:00:05+00:00", status: "normal", lines: [], more: 0, attribution: "x" });
  render(<App />);
  const museum = within(card()).getByRole("listitem", { name: /Museum/ });
  expect(museum).toHaveTextContent("3 min walk");
  expect(museum).toHaveTextContent("T2, T3, T8");
  const central = within(card()).getByRole("listitem", { name: /Central/ });
  expect(central).toHaveTextContent("9 min walk");
  expect(central).toHaveTextContent("T1, T2, T3, T4, T8, T9");
  await within(card()).findByText(/running normally/i);
});

test("says services are running normally with no disruption lines", async () => {
  respond({ updated: "2026-10-25T20:00:05+00:00", status: "normal", lines: [], more: 0, attribution: "x" });
  render(<App />);
  expect(await within(card()).findByText(/running normally/i)).toBeInTheDocument();
  expect(within(card()).queryByRole("list", { name: "Disruptions" })).not.toBeInTheDocument();
});

test("lists each affected line with its summary and a count of further updates", async () => {
  respond({
    updated: "2026-10-25T20:00:05+00:00",
    status: "disruptions",
    lines: [
      { line: "T8 Airport & South Line", summary: "<b>Buses replace trains</b>" },
      { line: "T2 Inner West Line", summary: "Delays" },
    ],
    more: 5,
    attribution: "x",
  });
  render(<App />);
  const list = await within(card()).findByRole("list", { name: "Disruptions" });
  const items = within(list).getAllByRole("listitem");
  expect(items).toHaveLength(2);
  expect(items[0]).toHaveTextContent("T8 Airport & South Line");
  expect(items[0]).toHaveTextContent("<b>Buses replace trains</b>");
  expect(within(card()).getByText("5 further updates")).toBeInTheDocument();
});

test("shows the last updated time in Sydney 24-hour time and the attribution", async () => {
  respond({
    updated: "2026-10-25T20:00:05+00:00",
    status: "normal",
    lines: [],
    more: 0,
    attribution: "Data: Transport for NSW Open Data, CC BY 4.0",
  });
  render(<App />);
  expect(await within(card()).findByText(/Updated 07:00/)).toBeInTheDocument();
  expect(within(card()).getByText("Data: Transport for NSW Open Data, CC BY 4.0")).toBeInTheDocument();
});

test("shows a calm message and still the stations when the data is missing", async () => {
  respond({}, false);
  render(<App />);
  expect(await within(card()).findByText(/not available yet/i)).toBeInTheDocument();
  expect(within(card()).getByRole("listitem", { name: /Museum/ })).toBeInTheDocument();
});

test("shows a calm message when the data is unreadable or the request fails", async () => {
  respond({ status: "weird" });
  const first = render(<App />);
  expect(await within(card()).findByText(/not available yet/i)).toBeInTheDocument();
  first.unmount();
  reject();
  render(<App />);
  expect(await within(card()).findByText(/not available yet/i)).toBeInTheDocument();
});
