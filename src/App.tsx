import { loadSchedule } from "./schedule";

const schedule = loadSchedule();

export default function App() {
  return (
    <main className="page">
      <header className="page-header">
        <h1>PlatformCon Day Planner</h1>
        <p className="muted">Wednesday 28 October 2026, Sydney Masonic Centre</p>
      </header>
      <section className="schedule" aria-label="Schedule">
        {schedule.map((session) => (
          <article key={`${session.time}-${session.title}`} className="session">
            <time className="session-time">{session.time}</time>
            <div className="session-body">
              <h2 className="session-title">{session.title}</h2>
              <span className="chip">{session.track}</span>
              {session.speakers && <p className="muted">{session.speakers}</p>}
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
