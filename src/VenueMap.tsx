import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Tint } from "./tints";
import { VENUE } from "./venue";

export type MapPin = { name: string; lat: number; lon: number; kind: "venue" | "lunch" };

type Props = {
  pins: MapPin[];
  tint?: Tint;
};

const TILES = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const MAX_ZOOM = 19;
const CLOSEST_ZOOM = 17;
const FIT_PADDING: L.PointTuple = [24, 24];
const PIN_RADIUS = 8;
const PIN_WEIGHT = 2;

const pinsKey = (pins: MapPin[]): string => {
  return JSON.stringify(pins.map(({ name, lat, lon, kind }) => ({ name, lat, lon, kind })));
};

const pinsFromKey = (key: string): MapPin[] => {
  return JSON.parse(key) as MapPin[];
};

const mapLabel = (pins: MapPin[]): string => {
  const lunchSpots = pins.filter((pin) => pin.kind === "lunch").length;
  if (lunchSpots === 0) return `Map of ${VENUE.name}`;
  return `Map of ${VENUE.name} and ${lunchSpots} lunch ${lunchSpots === 1 ? "spot" : "spots"}`;
};

const position = (pin: MapPin): L.LatLngTuple => {
  return [pin.lat, pin.lon];
};

const textLabel = (text: string): HTMLElement => {
  const label = document.createElement("span");
  label.textContent = text;
  return label;
};

const addPin = (layer: L.LayerGroup, pin: MapPin) => {
  L.circleMarker(position(pin), {
    className: `venue-pin venue-pin-${pin.kind}`,
    radius: PIN_RADIUS,
    weight: PIN_WEIGHT,
    fillOpacity: 1,
  })
    .bindTooltip(textLabel(pin.name))
    .addTo(layer);
};

const frame = (map: L.Map, pins: MapPin[]) => {
  if (pins.length === 0) {
    map.setView([VENUE.lat, VENUE.lon], CLOSEST_ZOOM);
    return;
  }
  map.fitBounds(L.latLngBounds(pins.map(position)), {
    padding: FIT_PADDING,
    maxZoom: CLOSEST_ZOOM,
  });
};

type Drawn = { map: L.Map; layer: L.LayerGroup };

const drawMap = (element: HTMLElement): Drawn => {
  const map = L.map(element, { scrollWheelZoom: false, attributionControl: false });
  L.tileLayer(TILES, { maxZoom: MAX_ZOOM }).addTo(map);
  return { map, layer: L.layerGroup().addTo(map) };
};

const placePins = ({ map, layer }: Drawn, pins: MapPin[]) => {
  layer.clearLayers();
  pins.forEach((pin) => addPin(layer, pin));
  frame(map, pins);
};

export default function VenueMap({ pins, tint }: Props) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const drawnRef = useRef<Drawn | null>(null);
  const key = pinsKey(pins);

  useEffect(() => {
    const element = canvasRef.current;
    if (!element) return;
    const drawn = drawMap(element);
    drawnRef.current = drawn;
    return () => {
      drawnRef.current = null;
      drawn.map.remove();
    };
  }, []);

  useEffect(() => {
    const drawn = drawnRef.current;
    if (!drawn) return;
    placePins(drawn, pinsFromKey(key));
  }, [key]);

  return (
    <figure className="venue-map" data-tint={tint}>
      <div className="venue-map-canvas" ref={canvasRef} role="img" aria-label={mapLabel(pins)} />
      <figcaption className="venue-map-credit">Map data © OpenStreetMap contributors</figcaption>
    </figure>
  );
}
