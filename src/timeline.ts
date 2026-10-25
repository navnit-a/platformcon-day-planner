import type { Session } from "./sessions";
import { groupByTime } from "./slots";

export type Tick = { label: string; position: number };

export type Dot = {
  key: string;
  time: string;
  track: string;
  position: number;
  stack: number;
};

const MINUTES_PER_HOUR = 60;

export function toMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * MINUTES_PER_HOUR + minutes;
}

const asTime = (minutes: number) =>
  `${String(Math.floor(minutes / MINUTES_PER_HOUR)).padStart(2, "0")}:${String(
    minutes % MINUTES_PER_HOUR,
  ).padStart(2, "0")}`;

export function positionOf(time: string, first: string, last: string): number {
  const span = toMinutes(last) - toMinutes(first);
  return span > 0 ? (toMinutes(time) - toMinutes(first)) / span : 0;
}

export function hourTicks(first: string, last: string): Tick[] {
  const start = Math.ceil(toMinutes(first) / MINUTES_PER_HOUR);
  const end = Math.floor(toMinutes(last) / MINUTES_PER_HOUR);
  return Array.from({ length: Math.max(end - start + 1, 0) }, (_, index) => {
    const label = asTime((start + index) * MINUTES_PER_HOUR);
    return { label, position: positionOf(label, first, last) };
  });
}

export function dayBounds(sessions: Session[]): { first: string; last: string } | null {
  const slots = groupByTime(sessions);
  if (slots.length === 0) return null;
  return { first: slots[0].time, last: slots[slots.length - 1].time };
}

export function glanceDots(sessions: Session[]): Dot[] {
  const bounds = dayBounds(sessions);
  if (!bounds) return [];
  return groupByTime(sessions).flatMap((slot) =>
    slot.sessions.map((session, stack) => ({
      key: `${session.time}-${session.title}`,
      time: session.time,
      track: session.track,
      position: positionOf(session.time, bounds.first, bounds.last),
      stack,
    })),
  );
}

export function glanceSummary(sessions: Session[]): string {
  const bounds = dayBounds(sessions);
  if (!bounds) return "Day at a glance: no sessions";
  const count = `${sessions.length} ${sessions.length === 1 ? "session" : "sessions"}`;
  return `Day at a glance: ${count} from ${bounds.first} to ${bounds.last}`;
}
