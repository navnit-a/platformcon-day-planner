import type { CSSProperties } from "react";
import { dayBounds, glanceDots, glanceSummary, hourTicks } from "./timeline";
import type { Session } from "./sessions";
import { trackTint } from "./tints";

type Props = {
  sessions: Session[];
  tracks: string[];
};

const placed = (position: number, stack = 0) =>
  ({ "--x": position, "--stack": stack }) as CSSProperties;

export default function Glance({ sessions, tracks }: Props) {
  const bounds = dayBounds(sessions);
  if (!bounds) return null;
  const ticks = hourTicks(bounds.first, bounds.last);

  return (
    <section className="glance shell rise rise-4">
      <figure className="glance-card" role="img" aria-label={glanceSummary(sessions)}>
        <div className="glance-head" aria-hidden="true">
          <span className="glance-title">Day at a glance</span>
          <span className="glance-span">
            {bounds.first} to {bounds.last}
          </span>
        </div>
        <div className="glance-track" aria-hidden="true">
          <span className="glance-axis" />
          {ticks.map((tick) => (
            <span key={tick.label} className="glance-tick" style={placed(tick.position)}>
              <span className="tick-long">{tick.label}</span>
              <span className="tick-short">{tick.label.slice(0, 2)}</span>
            </span>
          ))}
          {glanceDots(sessions).map((dot) => (
            <span
              key={dot.key}
              className="glance-dot"
              data-tint={trackTint(dot.track, tracks)}
              style={placed(dot.position, dot.stack)}
            />
          ))}
        </div>
      </figure>
    </section>
  );
}
