import { useId } from "react";
import type { Session } from "./sessions";
import { trackTint } from "./tints";

const ROOMS = [
  "Main Stage",
  "Workshop Room 1",
  "Workshop Room 2",
  "Roundtables",
];

type Props = {
  sessions: Session[];
  tracks: string[];
  onOpen: (session: Session, opener: HTMLButtonElement) => void;
};

function Room({ room, sessions, tracks, onOpen }: Props & { room: string }) {
  const headingId = useId();
  const inRoom = sessions
    .filter((s) => s.track === room)
    .sort((a, b) => a.time.localeCompare(b.time));
  return (
    <div
      className="room-card"
      role="group"
      aria-labelledby={headingId}
      data-tint={trackTint(room, tracks)}
    >
      <h2 className="room-heading" id={headingId}>
        <span className="dot" aria-hidden="true" />
        {room}
      </h2>
      <ul className="room-sessions">
        {inRoom.map((session) => (
          <li key={`${session.time}-${session.title}`} className="room-session">
            <time className="room-time">{session.time}</time>
            <button
              type="button"
              className="room-open"
              onClick={(event) => onOpen(session, event.currentTarget)}
            >
              {session.title}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Rooms({ sessions, tracks, onOpen }: Props) {
  return (
    <section className="rooms shell rise rise-6" aria-label="Rooms">
      {ROOMS.map((room) => (
        <Room
          key={room}
          room={room}
          sessions={sessions}
          tracks={tracks}
          onOpen={onOpen}
        />
      ))}
    </section>
  );
}
