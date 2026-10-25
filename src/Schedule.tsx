import { useState } from "react";
import type { Session } from "./schedule";
import { sessionId } from "./starred";

type Props = {
  sessions: Session[];
  tracks: string[];
  view: "schedule" | "agenda";
  starred: Set<string>;
  onToggle: (id: string) => void;
  onOpen: (session: Session, opener: HTMLButtonElement) => void;
};

export default function Schedule({ sessions, tracks, view, starred, onToggle, onOpen }: Props) {
  const [track, setTrack] = useState<string | null>(null);
  const isAgenda = view === "agenda";
  const visible = !isAgenda && track ? sessions.filter((s) => s.track === track) : sessions;

  return (
    <>
      {!isAgenda && (
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
      )}
      <section className="schedule" aria-label={isAgenda ? "My agenda" : "Schedule"}>
        {isAgenda && visible.length === 0 && (
          <p className="empty">Star sessions on the schedule to build your plan.</p>
        )}
        {!isAgenda && visible.length === 0 && <p className="muted">No sessions in this track.</p>}
        {visible.map((session) => {
          const id = sessionId(session);
          const isStarred = starred.has(id);
          return (
            <article key={id} className="session">
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
              <button
                type="button"
                className="star"
                aria-pressed={isStarred}
                aria-label={`${isStarred ? "Unstar" : "Star"} ${session.title}`}
                onClick={() => onToggle(id)}
              >
                <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
                  <path
                    d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"
                    fill={isStarred ? "currentColor" : "none"}
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </article>
          );
        })}
      </section>
    </>
  );
}
