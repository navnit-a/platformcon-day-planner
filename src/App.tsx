import { useLayoutEffect, useRef, useState } from "react";
import { loadSchedule, type Session } from "./schedule";
import SessionDetail from "./SessionDetail";
import { applyTheme, initialTheme, saveTheme, type Theme } from "./theme";

const schedule = loadSchedule();

export default function App() {
  const [open, setOpen] = useState<Session | null>(null);
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const opener = useRef<HTMLButtonElement | null>(null);

  useLayoutEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    saveTheme(next);
    setTheme(next);
  };

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
        <button type="button" className="pill theme-toggle" onClick={toggleTheme}>
          {`Switch to ${theme === "dark" ? "light" : "dark"} look`}
        </button>
      </header>
      <section className="schedule" aria-label="Schedule">
        {schedule.map((session) => (
          <article key={`${session.time}-${session.title}`} className="session">
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
          </article>
        ))}
      </section>
      {open && <SessionDetail session={open} onClose={close} />}
    </main>
  );
}
