import { useRef, useState } from "react";
import { loadSchedule, type Session } from "./schedule";
import SessionDetail from "./SessionDetail";
import { sessionId, useStarred } from "./starred";

const schedule = loadSchedule();

export default function App() {
  const [open, setOpen] = useState<Session | null>(null);
  const [view, setView] = useState<"schedule" | "agenda">("schedule");
  const { starred, toggle } = useStarred();
  const shown =
    view === "agenda" ? schedule.filter((session) => starred.has(sessionId(session))) : schedule;
  const opener = useRef<HTMLButtonElement | null>(null);

  const close = () => {
    setOpen(null);
    opener.current?.focus();
  };

  return (
    <main className="page">
      <header className="page-header">
        <h1>PlatformCon Day Planner</h1>
        <p className="muted">Wednesday 28 October 2026, Sydney Masonic Centre</p>
        <p className="muted">
          {schedule.length} {schedule.length === 1 ? "session" : "sessions"}
        </p>
      </header>
      <nav className="views" aria-label="Views">
        <button
          type="button"
          className="view"
          aria-pressed={view === "schedule"}
          onClick={() => setView("schedule")}
        >
          Schedule
        </button>
        <button
          type="button"
          className="view"
          aria-pressed={view === "agenda"}
          onClick={() => setView("agenda")}
        >
          My agenda ({starred.size})
        </button>
      </nav>
      <section
        className="schedule"
        aria-label={view === "agenda" ? "My agenda" : "Schedule"}
      >
        {view === "agenda" && shown.length === 0 && (
          <p className="empty">Star sessions on the schedule to build your plan.</p>
        )}
        {shown.map((session) => {
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
                    onClick={(event) => {
                      opener.current = event.currentTarget;
                      setOpen(session);
                    }}
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
                onClick={() => toggle(id)}
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
      {open && <SessionDetail session={open} onClose={close} />}
    </main>
  );
}
