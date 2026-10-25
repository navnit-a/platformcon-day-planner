import { AvatarStack } from "./Avatar";
import type { Session } from "./sessions";
import { speakerPeople } from "./speakers";
import type { Tint } from "./tints";

type Props = {
  session: Session;
  tint: Tint;
  featured: boolean;
  starred: boolean;
  onToggle: () => void;
  onOpen: (session: Session, opener: HTMLButtonElement) => void;
};

export default function SessionCard({ session, tint, featured, starred, onToggle, onOpen }: Props) {
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
      <button
        type="button"
        className="star"
        aria-pressed={starred}
        aria-label={`${starred ? "Unstar" : "Star"} ${session.title}`}
        onClick={onToggle}
      >
        <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
          <path
            d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"
            fill={starred ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      </button>
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
