import type { Session } from "./sessions";

export type DayStats = {
  sessions: number;
  rooms: number;
  days: number;
};

export function dayStats(sessions: Session[]): DayStats {
  const rooms = new Set(sessions.map((s) => s.track).filter(Boolean));
  return { sessions: sessions.length, rooms: rooms.size, days: sessions.length > 0 ? 1 : 0 };
}

const counted = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`;

export function statLabels(stats: DayStats): string[] {
  return [
    counted(stats.sessions, "session", "sessions"),
    counted(stats.rooms, "room", "rooms"),
    counted(stats.days, "day", "days"),
  ];
}
