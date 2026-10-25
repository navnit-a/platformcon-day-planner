import type { Session } from "./sessions";

export type Slot = {
  time: string;
  sessions: Session[];
};

export function groupByTime(sessions: Session[]): Slot[] {
  const ordered = [...sessions].sort((a, b) => a.time.localeCompare(b.time));
  return ordered.reduce<Slot[]>((slots, session) => {
    const last = slots.at(-1);
    if (last?.time === session.time) {
      return [...slots.slice(0, -1), { ...last, sessions: [...last.sessions, session] }];
    }
    return [...slots, { time: session.time, sessions: [session] }];
  }, []);
}
