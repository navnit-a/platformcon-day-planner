import { useState } from "react";
import { featuredSession } from "./featured";
import type { Session } from "./sessions";
import { groupByTime } from "./slots";
import TimeSlot from "./TimeSlot";
import TrackFilter from "./TrackFilter";

type Props = {
  sessions: Session[];
  tracks: string[];
  onOpen: (session: Session, opener: HTMLButtonElement) => void;
};

export default function Schedule({ sessions, tracks, onOpen }: Props) {
  const [track, setTrack] = useState<string | null>(null);
  const visible = track ? sessions.filter((s) => s.track === track) : sessions;
  const slots = groupByTime(visible);
  const featured = featuredSession(sessions);

  return (
    <>
      <TrackFilter
        tracks={tracks}
        chosen={track}
        onChoose={setTrack}
        onClear={() => setTrack(null)}
      />
      <section className="schedule shell rise rise-6" aria-label="Schedule">
        {slots.length === 0 && <p className="empty">No sessions in this track.</p>}
        {slots.map((slot) => (
          <TimeSlot
            key={slot.time}
            slot={slot}
            tracks={tracks}
            featured={featured}
            onOpen={onOpen}
          />
        ))}
      </section>
    </>
  );
}
