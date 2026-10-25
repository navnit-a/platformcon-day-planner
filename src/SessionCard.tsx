import { AvatarStack } from "./Avatar";
import type { Session } from "./sessions";
import { speakerPeople } from "./speakers";
import type { Tint } from "./tints";

type Props = {
  session: Session;
  tint: Tint;
  featured: boolean;
  onOpen: (session: Session, opener: HTMLButtonElement) => void;
};

export default function SessionCard({ session, tint, featured, onOpen }: Props) {
  const people = speakerPeople(session.speakers);
  return (
    <article className={featured ? "session session-featured" : "session"} data-tint={tint}>
      <time className="visually-hidden">{session.time}</time>
      <div className="session-tags">
        {session.track && (
          <span className="room">
            <span className="dot" aria-hidden="true" />
            {session.track}
          </span>
        )}
        {featured && <span className="featured-label">Opens the day</span>}
      </div>
      <h2 className="session-title">
        <button
          type="button"
          className="session-open"
          onClick={(event) => onOpen(session, event.currentTarget)}
        >
          {session.title}
        </button>
      </h2>
      {session.speakers && (
        <div className="session-speakers" data-many={people.length > 2 || undefined}>
          <AvatarStack names={people} />
          <p className="speakers-text">{session.speakers}</p>
        </div>
      )}
    </article>
  );
}
