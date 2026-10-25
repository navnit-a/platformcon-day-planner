import { render, screen } from "@testing-library/react";
import L from "leaflet";
import { beforeEach, expect, test, vi } from "vitest";
import { VENUE } from "./venue";
import VenueMap from "./VenueMap";

vi.mock("leaflet", () => {
  const map = { fitBounds: vi.fn(), setView: vi.fn(), remove: vi.fn() };
  return {
    default: {
      map: vi.fn(() => map),
      tileLayer: vi.fn(() => ({ addTo: vi.fn() })),
      circleMarker: vi.fn(() => ({ addTo: vi.fn(), bindTooltip: vi.fn().mockReturnThis() })),
      latLngBounds: vi.fn(() => ({})),
    },
  };
});

const PINS = [
  { name: "Venue", lat: 1, lon: 2, kind: "venue" as const },
  { name: "Cafe", lat: 1.1, lon: 2.1, kind: "lunch" as const },
];

const createdMap = () => {
  return vi.mocked(L.map).mock.results[0].value;
};

beforeEach(() => {
  vi.clearAllMocks();
});

test("VenueMap pins the venue and each lunch spot", () => {
  render(<VenueMap pins={PINS} />);
  expect(L.circleMarker).toHaveBeenCalledTimes(2);
  expect(L.tileLayer).toHaveBeenCalledWith(
    "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    expect.objectContaining({ maxZoom: 19 }),
  );
  expect(screen.getByText(/© OpenStreetMap contributors/)).toBeInTheDocument();
});

test("VenueMap marks the venue and lunch pins with their own classes", () => {
  render(<VenueMap pins={PINS} />);
  expect(L.circleMarker).toHaveBeenNthCalledWith(
    1,
    [1, 2],
    expect.objectContaining({ className: "venue-pin venue-pin-venue" }),
  );
  expect(L.circleMarker).toHaveBeenNthCalledWith(
    2,
    [1.1, 2.1],
    expect.objectContaining({ className: "venue-pin venue-pin-lunch" }),
  );
});

const tooltipOf = (index: number): HTMLElement => {
  return vi.mocked(L.circleMarker).mock.results[index].value.bindTooltip.mock.calls[0][0];
};

test("VenueMap names each pin in its tooltip", () => {
  render(<VenueMap pins={PINS} />);
  expect(tooltipOf(0).textContent).toBe("Venue");
  expect(tooltipOf(1).textContent).toBe("Cafe");
});

test("VenueMap shows a pin name with markup as plain text", () => {
  const name = "<img src=x onerror=alert(1)>";
  render(<VenueMap pins={[{ name, lat: 1, lon: 2, kind: "lunch" }]} />);
  const tooltip = tooltipOf(0);
  expect(tooltip).toBeInstanceOf(HTMLElement);
  expect(tooltip.textContent).toBe(name);
  expect(tooltip.querySelector("img")).toBeNull();
});

test("VenueMap lets the page scroll past it and leaves attribution to the caption", () => {
  render(<VenueMap pins={PINS} />);
  expect(L.map).toHaveBeenCalledWith(
    expect.any(HTMLElement),
    expect.objectContaining({ scrollWheelZoom: false, attributionControl: false }),
  );
});

test("VenueMap fits every pin in view with room around them", () => {
  render(<VenueMap pins={PINS} />);
  expect(L.latLngBounds).toHaveBeenCalledWith([
    [1, 2],
    [1.1, 2.1],
  ]);
  expect(createdMap().fitBounds).toHaveBeenCalledWith(expect.anything(), { padding: [24, 24] });
});

test("VenueMap centres on the venue when there are no pins", () => {
  render(<VenueMap pins={[]} />);
  expect(createdMap().fitBounds).not.toHaveBeenCalled();
  expect(createdMap().setView).toHaveBeenCalledWith([VENUE.lat, VENUE.lon], expect.any(Number));
});

test("VenueMap carries a track tint when given one", () => {
  const { container } = render(<VenueMap pins={PINS} tint={5} />);
  expect(container.querySelector("figure")).toHaveAttribute("data-tint", "5");
});

test("VenueMap removes the map on unmount", () => {
  const { unmount } = render(<VenueMap pins={[]} />);
  unmount();
  expect(createdMap().remove).toHaveBeenCalled();
});
