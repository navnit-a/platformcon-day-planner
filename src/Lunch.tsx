import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useId, useRef, useState } from "react";
import { loadLunch, sydneyTime, VENUE, type LunchData } from "./lunch";

const TILES = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

function LunchMap({ data }: { data: LunchData }) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = container.current;
    if (!element) return;
    const map = L.map(element, {
      scrollWheelZoom: false,
      touchZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      zoomControl: false,
      attributionControl: false,
      dragging: !L.Browser.mobile,
      keyboard: false,
    });
    L.tileLayer(TILES, { maxZoom: 19 }).addTo(map);
    const point = (title: string, lat: number, lon: number, className: string) => {
      const label = document.createElement("span");
      label.textContent = title;
      L.marker([lat, lon], {
        title,
        keyboard: false,
        icon: L.divIcon({ className: `lunch-pin ${className}`, iconSize: [16, 16] }),
      })
        .bindTooltip(label)
        .addTo(map);
    };
    point(`${VENUE.name}, ${VENUE.street}`, VENUE.lat, VENUE.lon, "lunch-pin-venue");
    for (const pick of data.picks) point(pick.name, pick.lat, pick.lon, "lunch-pin-spot");
    map.fitBounds(
      L.latLngBounds([[VENUE.lat, VENUE.lon], ...data.picks.map((p): [number, number] => [p.lat, p.lon])]),
      { padding: [24, 24], animate: false },
    );
    return () => {
      map.remove();
    };
  }, [data]);

  return (
    <div
      ref={container}
      className="lunch-map"
      role="img"
      aria-label={`Map of ${VENUE.name} and three lunch spots nearby`}
    />
  );
}

export default function Lunch() {
  const [data, setData] = useState<LunchData | null | undefined>(undefined);
  const headingId = useId();

  useEffect(() => {
    let live = true;
    loadLunch().then((loaded) => {
      if (live) setData(loaded);
    });
    return () => {
      live = false;
    };
  }, []);

  if (data === undefined) return null;

  return (
    <section className="lunch shell rise rise-5" aria-labelledby={headingId}>
      <div className="lunch-card">
        <h2 className="lunch-title" id={headingId}>
          Lunch nearby
        </h2>
        {data ? (
          <>
            <LunchMap data={data} />
            <p className="lunch-credit">Map data © OpenStreetMap contributors</p>
            <ul className="lunch-list">
              {data.picks.map((pick) => (
                <li key={`${pick.name}-${pick.lat}`} className="lunch-item">
                  <span className="lunch-name">{pick.name}</span>
                  <span className="lunch-meta">
                    {[pick.kind, pick.cuisine, pick.street].filter(Boolean).join(" · ")}
                  </span>
                  <span className="lunch-meta">
                    <span className="lunch-distance">{pick.distance_m} m</span> walk · {pick.reason}
                  </span>
                </li>
              ))}
            </ul>
            <p className="lunch-source">Updated {sydneyTime(data.updated)} Sydney time</p>
            <p className="lunch-source">{data.attribution}</p>
          </>
        ) : (
          <p className="lunch-empty">Lunch spots are not available yet. Check back soon.</p>
        )}
      </div>
    </section>
  );
}
