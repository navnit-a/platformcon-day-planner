import { useEffect, useRef } from "react";
import L from "leaflet";
import type { Tint } from "./tints";
import { VENUE } from "./venue";

export type MapPin = { name: string; lat: number; lon: number; kind: "venue" | "lunch" };

type Props = {
  pins: MapPin[];
  tint?: Tint;
};

const TILES = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const MAX_ZOOM = 19;
const VENUE_ZOOM = 17;
const FIT_PADDING: L.PointTuple = [24, 24];
const PIN_RADIUS = 8;
const PIN_WEIGHT = 2;

const position = (pin: MapPin): L.LatLngTuple => {
  return [pin.lat, pin.lon];
};

const textLabel = (text: string): HTMLElement => {
  const label = document.createElement("span");
  label.textContent = text;
  return label;
};

const addPin = (map: L.Map, pin: MapPin) => {
  L.circleMarker(position(pin), {
    className: `venue-pin venue-pin-${pin.kind}`,
    radius: PIN_RADIUS,
    weight: PIN_WEIGHT,
    fillOpacity: 1,
  })
    .bindTooltip(textLabel(pin.name))
    .addTo(map);
};

const frame = (map: L.Map, pins: MapPin[]) => {
  if (pins.length === 0) {
    map.setView([VENUE.lat, VENUE.lon], VENUE_ZOOM);
    return;
  }
  map.fitBounds(L.latLngBounds(pins.map(position)), { padding: FIT_PADDING });
};

const drawMap = (element: HTMLElement, pins: MapPin[]): L.Map => {
  const map = L.map(element, { scrollWheelZoom: false, attributionControl: false });
  L.tileLayer(TILES, { maxZoom: MAX_ZOOM }).addTo(map);
  pins.forEach((pin) => addPin(map, pin));
  frame(map, pins);
  return map;
};

export default function VenueMap({ pins, tint }: Props) {
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = canvasRef.current;
    if (!element) return;
    const map = drawMap(element, pins);
    return () => {
      map.remove();
    };
  }, [pins]);

  return (
    <figure className="venue-map" data-tint={tint}>
      <div className="venue-map-canvas" ref={canvasRef} />
      <figcaption className="venue-map-credit">Map data © OpenStreetMap contributors</figcaption>
    </figure>
  );
}
