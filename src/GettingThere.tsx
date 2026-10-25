import { useEffect, useState } from "react";

type Disruption = { line: string; summary: string };
type Trains = {
  updated: string;
  status: "normal" | "disruptions";
  lines: Disruption[];
  more: number;
  attribution: string;
};

const stations = [
  { name: "Museum", walk: 3, lines: ["T2", "T3", "T8"] },
  { name: "Central", walk: 9, lines: ["T1", "T2", "T3", "T4", "T8", "T9"] },
];

const isTrains = (data: unknown): data is Trains => {
  if (typeof data !== "object" || data === null) return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.updated === "string" &&
    !Number.isNaN(Date.parse(d.updated)) &&
    (d.status === "normal" || d.status === "disruptions") &&
    typeof d.attribution === "string" &&
    typeof d.more === "number" &&
    Array.isArray(d.lines) &&
    d.lines.every(
      (l) =>
        typeof l === "object" &&
        l !== null &&
        typeof (l as Disruption).line === "string" &&
        typeof (l as Disruption).summary === "string",
    )
  );
};

const sydneyTime = (iso: string) =>
  new Intl.DateTimeFormat("en-AU", {
    timeZone: "Australia/Sydney",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));

type State = { phase: "loading" } | { phase: "missing" } | { phase: "ready"; trains: Trains };

export default function GettingThere() {
  const [state, setState] = useState<State>({ phase: "loading" });

  useEffect(() => {
    let live = true;
    const settle = (next: State) => {
      if (live) setState(next);
    };
    (async () => {
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}data/trains.json`, {
          cache: "no-store",
        });
        if (!response.ok) return settle({ phase: "missing" });
        const data: unknown = await response.json();
        settle(isTrains(data) ? { phase: "ready", trains: data } : { phase: "missing" });
      } catch {
        settle({ phase: "missing" });
      }
    })();
    return () => {
      live = false;
    };
  }, []);

  return (
    <section className="getting shell rise rise-4" aria-labelledby="getting-title">
      <div className="getting-card">
        <p id="getting-title" className="getting-title">
          Getting there
        </p>
        <ul className="stations">
          {stations.map((station) => (
            <li
              key={station.name}
              className="station"
              aria-label={`${station.name}, ${station.walk} min walk`}
            >
              <span className="station-name">{station.name}</span>
              <span className="station-walk">{station.walk} min walk</span>
              <span className="station-lines">{station.lines.join(", ")}</span>
            </li>
          ))}
        </ul>
        {state.phase === "missing" && (
          <p className="getting-note">Train status is not available yet.</p>
        )}
        {state.phase === "ready" && (
          <>
            {state.trains.status === "normal" ? (
              <p className="getting-note">Services are running normally.</p>
            ) : (
              <>
                <ul className="disruptions" aria-label="Disruptions">
                  {state.trains.lines.map((item, index) => (
                    <li key={index} className="disruption">
                      <span className="disruption-line">{item.line}</span>
                      <span className="disruption-summary">{item.summary}</span>
                    </li>
                  ))}
                </ul>
                {state.trains.more > 0 && (
                  <p className="getting-note">
                    {state.trains.more} further {state.trains.more === 1 ? "update" : "updates"}
                  </p>
                )}
              </>
            )}
            <p className="getting-meta">
              <span className="getting-time">Updated {sydneyTime(state.trains.updated)}</span>
              <span>{state.trains.attribution}</span>
            </p>
          </>
        )}
      </div>
    </section>
  );
}
