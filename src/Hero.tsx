import Mark from "./Mark";
import type { Theme } from "./theme";
import ThemeSwitch from "./ThemeSwitch";

type Props = {
  sessionCount: number;
  theme: Theme;
  onToggleTheme: () => void;
};

export default function Hero({ sessionCount, theme, onToggleTheme }: Props) {
  return (
    <header className="hero shell">
      <div className="hero-bar rise">
        <p className="brand">
          <Mark />
          <span>PlatformCon Sydney</span>
        </p>
        <ThemeSwitch theme={theme} onToggle={onToggleTheme} />
      </div>
      <div className="hero-main">
        <div className="hero-intro rise rise-1">
          <h1>PlatformCon Day Planner</h1>
          <p className="hero-lede">The full programme for the day, grouped by start time.</p>
        </div>
        <div className="date-card rise rise-2">
          <div className="date-core">
            <div className="date-block" aria-hidden="true">
              <span className="date-day">28</span>
              <span className="date-month">Oct</span>
              <span className="date-weekday">Wednesday</span>
            </div>
            <p className="date-line">Wednesday 28 October 2026, Sydney Masonic Centre</p>
            <p className="stat">
              {sessionCount} {sessionCount === 1 ? "session" : "sessions"}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
