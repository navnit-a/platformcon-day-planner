import type { Theme } from "./theme";

type Props = {
  theme: Theme;
  onToggle: () => void;
};

function MoonIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
      <path d="M15.5 12.4A6.5 6.5 0 0 1 7.6 4.5a6.5 6.5 0 1 0 7.9 7.9z" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
      <circle cx="10" cy="10" r="3.25" />
      <path d="M10 2.5v1.75M10 15.75v1.75M2.5 10h1.75M15.75 10h1.75M4.7 4.7l1.25 1.25M14.05 14.05l1.25 1.25M4.7 15.3l1.25-1.25M14.05 5.95l1.25-1.25" />
    </svg>
  );
}

export default function ThemeSwitch({ theme, onToggle }: Props) {
  const next = theme === "dark" ? "light" : "dark";
  return (
    <button
      type="button"
      className="theme-switch"
      aria-label={`Switch to ${next} look`}
      onClick={onToggle}
    >
      {next === "dark" ? <MoonIcon /> : <SunIcon />}
      <span>{next === "dark" ? "Dark look" : "Light look"}</span>
    </button>
  );
}
