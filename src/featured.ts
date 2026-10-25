import type { Session } from "./sessions";
import { groupByTime } from "./slots";

export const FEATURED_TRACK = "Main Stage";

export function featuredSession(sessions: Session[]): Session | null {
  const onStage = sessions.filter((s) => s.track === FEATURED_TRACK);
  return groupByTime(onStage)[0]?.sessions[0] ?? null;
}
