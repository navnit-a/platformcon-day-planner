import { useLayoutEffect, useRef, useState } from "react";
import Footer from "./Footer";
import GettingThere from "./GettingThere";
import Glance from "./Glance";
import Hero from "./Hero";
import Lunch from "./Lunch";
import Rooms from "./Rooms";
import Schedule from "./Schedule";
import SessionDetail from "./SessionDetail";
import { loadSchedule, type Session } from "./sessions";
import { sessionId, useStarred } from "./starred";
import { dayStats } from "./stats";
import { applyTheme, initialTheme, saveTheme, type Theme } from "./theme";
import { trackTint } from "./tints";
import ViewSwitch, { type View } from "./ViewSwitch";

const schedule = loadSchedule();
const tracks = [...new Set(schedule.map((s) => s.track))];
const stats = dayStats(schedule);

export default function App() {
  const [open, setOpen] = useState<Session | null>(null);
  const [view, setView] = useState<View>("schedule");
  const { starred, toggle } = useStarred();
  const shown =
    view === "agenda" ? schedule.filter((session) => starred.has(sessionId(session))) : schedule;
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

  const onOpen = (session: Session, button: HTMLButtonElement) => {
    opener.current = button;
    setOpen(session);
  };

  return (
    <>
      <Hero stats={stats} theme={theme} onToggleTheme={toggleTheme} />
      <main>
        <Glance sessions={schedule} tracks={tracks} />
        <GettingThere />
        <Lunch />
        <ViewSwitch view={view} agendaCount={starred.size} onChoose={setView} />
        {view === "rooms" ? (
          <Rooms sessions={schedule} tracks={tracks} onOpen={onOpen} />
        ) : (
          <Schedule
            sessions={shown}
            tracks={tracks}
            view={view}
            starred={starred}
            onToggle={toggle}
            onOpen={onOpen}
          />
        )}
      </main>
      <Footer />
      {open && (
        <SessionDetail
          session={open}
          tint={trackTint(open.track, tracks)}
          onClose={close}
        />
      )}
    </>
  );
}
