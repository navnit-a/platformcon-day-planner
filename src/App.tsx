import { useLayoutEffect, useRef, useState } from "react";
import { loadSchedule, type Session } from "./schedule";
import Schedule from "./Schedule";
import SessionDetail from "./SessionDetail";
import { applyTheme, initialTheme, saveTheme, type Theme } from "./theme";

const schedule = loadSchedule();
const tracks = [...new Set(schedule.map((s) => s.track))];

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
      <Schedule
        sessions={schedule}
        tracks={tracks}
        onOpen={(session, button) => {
          opener.current = button;
          setOpen(session);
        }}
      />
      {open && <SessionDetail session={open} onClose={close} />}
    </main>
  );
}
