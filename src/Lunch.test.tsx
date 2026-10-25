import { render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import App from "./App";
import Lunch from "./Lunch";

const lunch = {
  updated: "2026-10-25T20:18:42+00:00",
  place: "Sydney Masonic Centre",
  picks: [
    { name: "Storehouse", kind: "restaurant", cuisine: "thai", distance_m: 71, street: "Goulburn Street", lat: -33.8786, lon: 151.2094, reason: "a sit-down lunch" },
    { name: "<b>Caffe Tiamo</b>", kind: "cafe", cuisine: "", distance_m: 135, street: "", lat: -33.878, lon: 151.208, reason: "a quick coffee" },
    { name: "Masala Kitchen", kind: "restaurant", cuisine: "indian", distance_m: 148, street: "Pitt Street", lat: -33.8777, lon: 151.2074, reason: "a sit-down lunch" },
  ],
  attribution: "Data: OpenStreetMap contributors, ODbL",
};

const respond = (body: unknown, ok = true) =>
  vi.stubGlobal("fetch", vi.fn(async () => ({ ok, json: async () => body })));

afterEach(() => vi.unstubAllGlobals());

test("lists exactly three lunch spots with their details", async () => {
  respond(lunch);
  render(<Lunch />);
  const card = await screen.findByRole("region", { name: "Lunch nearby" });
  const items = await within(card).findAllByRole("listitem");
  expect(items).toHaveLength(3);
  expect(items[0]).toHaveTextContent("Storehouse");
  expect(items[0]).toHaveTextContent("restaurant");
  expect(items[0]).toHaveTextContent("thai");
  expect(items[0]).toHaveTextContent("Goulburn Street");
  expect(items[0]).toHaveTextContent("71 m");
  expect(items[0]).toHaveTextContent("a sit-down lunch");
  expect(items[1]).toHaveTextContent("<b>Caffe Tiamo</b>");
});

test("pins the venue, marks the three spots and credits OpenStreetMap under the map", async () => {
  respond(lunch);
  render(<Lunch />);
  await screen.findByText("Storehouse");
  expect(screen.getByTitle("Sydney Masonic Centre, 66 Goulburn Street")).toBeInTheDocument();
  for (const name of ["Storehouse", "<b>Caffe Tiamo</b>", "Masala Kitchen"]) {
    expect(screen.getByTitle(name)).toBeInTheDocument();
  }
  expect(screen.getByText("Map data © OpenStreetMap contributors")).toBeInTheDocument();
});

test("shows the updated time in Sydney 24-hour time with the attribution", async () => {
  respond(lunch);
  render(<Lunch />);
  expect(await screen.findByText(/Updated 07:18/)).toBeInTheDocument();
  expect(screen.getByText("Data: OpenStreetMap contributors, ODbL")).toBeInTheDocument();
});

test.each([
  ["missing", () => respond({}, false)],
  ["unreadable", () => respond({ picks: "nope" })],
  ["too few spots", () => respond({ ...lunch, picks: lunch.picks.slice(0, 2) })],
])("shows a calm not available yet message when the data is %s", async (_name, setup) => {
  setup();
  render(<Lunch />);
  expect(await screen.findByText(/not available yet/i)).toBeInTheDocument();
});

test("the rest of the page works when lunch data is missing", async () => {
  respond({}, false);
  render(<App />);
  await waitFor(() => expect(screen.getByText(/lunch spots are not available yet/i)).toBeInTheDocument());
  expect(screen.getAllByRole("article").length).toBeGreaterThan(0);
});

test("the map does not zoom under a finger or the scroll wheel", async () => {
  respond(lunch);
  render(<Lunch />);
  await screen.findByText("Storehouse");
  const map = screen.getByRole("img", { name: /map of/i });
  expect(map).toBeInTheDocument();
  expect(map.querySelector(".leaflet-control-zoom")).toBeNull();
  expect(map.classList.contains("leaflet-touch-zoom")).toBe(false);
  expect(map.classList.contains("leaflet-drag")).toBe(false);
});
