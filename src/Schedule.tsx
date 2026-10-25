import { useState } from "react";
import { featuredSession } from "./featured";
import type { Session } from "./sessions";
import { groupByTime } from "./slots";
import TimeSlot from "./TimeSlot";
import TrackFilter from "./TrackFilter";

type Props = {
  sessions: Session[];
  tracks: string[];
  view: "schedule" | "agenda";
  starred: Set<string>;
  onToggle: (id: string) => void;
  onOpen: (session: Session, opener: HTMLButtonElement) => void;
};

export default function Schedule({ sessions, tracks, view, starred, onToggle, onOpen }: Props) {
  const [track, setTrack] = useState<string | null>(null);
  const isAgenda = view === "agenda";
  const visible = !isAgenda && track ? sessions.filter((s) => s.track === track) : sessions;
  const slots = groupByTime(visible);
  const featured = featuredSession(sessions);

  return (
    <>
      {!isAgenda && (
        <TrackFilter
          tracks={tracks}
          chosen={track}
          onChoose={setTrack}
          onClear={() => setTrack(null)}
        />
      )}
      <section
        className="schedule shell rise rise-6"
        aria-label={isAgenda ? "My agenda" : "Schedule"}
      >
        {slots.length === 0 && (
          <p className="empty">
            {isAgenda
              ? "Star sessions on the schedule to build your plan."
              : "No sessions in this track."}
          </p>
        )}
        {slots.map((slot) => (
          <TimeSlot
            key={slot.time}
            slot={slot}
            tracks={tracks}
            featured={featured}
            starred={starred}
            onToggle={onToggle}
            onOpen={onOpen}
          />
        ))}
      </section>
    </>
  );
}
