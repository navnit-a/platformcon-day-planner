import sessions from "./data/schedule.json";

export type Session = {
  time: string;
  track: string;
  title: string;
  speakers: string;
};

export function loadSchedule(): Session[] {
  return [...(sessions as Session[])].sort((a, b) => a.time.localeCompare(b.time));
}
