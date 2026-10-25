import { useState } from "react";
import type { Session } from "./schedule";

type Props = {
  sessions: Session[];
  tracks: string[];
  onOpen: (session: Session, opener: HTMLButtonElement) => void;
};

export default function Schedule({ sessions, tracks, onOpen }: Props) {
  const [track, setTrack] = useState<string | null>(null);
  const visible = track ? sessions.filter((s) => s.track === track) : sessions;

  return (
    <>
      <div className="filters" role="group" aria-label="Filter by track">
        {tracks.map((t) => (
          <button
            key={t}
            type="button"
            className="filter"
            aria-pressed={track === t}
            onClick={() => setTrack(t)}
          >
            {t}
          </button>
        ))}
        {track && (
          <button type="button" className="filter filter-clear" onClick={() => setTrack(null)}>
            Clear filter
          </button>
        )}
      </div>
      <section className="schedule" aria-label="Schedule">
        {visible.length === 0 && <p className="muted">No sessions in this track.</p>}
        {visible.map((session) => (
          <article key={`${session.time}-${session.title}`} className="session">
            <time className="session-time">{session.time}</time>
            <div className="session-body">
              <h2 className="session-title">
                <button
                  type="button"
                  className="session-open"
                  onClick={(event) => onOpen(session, event.currentTarget)}
                >
                  {session.title}
                </button>
              </h2>
              <span className="chip">{session.track}</span>
              {session.speakers && <p className="muted">{session.speakers}</p>}
            </div>
          </article>
        ))}
      </section>
    </>
  );
}
