import { useLayoutEffect, useRef, useState } from "react";
import Footer from "./Footer";
import Hero from "./Hero";
import Schedule from "./Schedule";
import SessionDetail from "./SessionDetail";
import { loadSchedule, type Session } from "./sessions";
import { applyTheme, initialTheme, saveTheme, type Theme } from "./theme";
import { trackTint } from "./tints";

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
    <>
      <Hero sessionCount={schedule.length} theme={theme} onToggleTheme={toggleTheme} />
      <main>
        <Schedule
          sessions={schedule}
          tracks={tracks}
          onOpen={(session, button) => {
            opener.current = button;
            setOpen(session);
          }}
        />
      </main>
      <Footer />
      {open && (
        <SessionDetail session={open} tint={trackTint(open.track, tracks)} onClose={close} />
      )}
    </>
  );
}
