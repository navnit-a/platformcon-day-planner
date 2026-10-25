import { useId } from "react";
import SessionCard from "./SessionCard";
import type { Session } from "./sessions";
import type { Slot } from "./slots";
import { trackTint } from "./tints";

type Props = {
  slot: Slot;
  tracks: string[];
  featured: Session | null;
  onOpen: (session: Session, opener: HTMLButtonElement) => void;
};

export default function TimeSlot({ slot, tracks, featured, onOpen }: Props) {
  const headingId = useId();
  return (
    <div className="slot" role="group" aria-labelledby={headingId}>
      <h2 className="slot-time" id={headingId}>
        <time>{slot.time}</time>
      </h2>
      <div className="slot-sessions" data-count={slot.sessions.length}>
        {slot.sessions.map((session) => (
          <SessionCard
            key={`${session.time}-${session.title}`}
            session={session}
            tint={trackTint(session.track, tracks)}
            featured={session === featured}
            onOpen={onOpen}
          />
        ))}
      </div>
    </div>
  );
}
