import { useEffect, useRef } from "react";
import { AvatarStack } from "./Avatar";
import type { Session } from "./sessions";
import { speakerEntries, speakerPeople } from "./speakers";
import type { Tint } from "./tints";

const TBC = "To be confirmed";

type Props = {
  session: Session;
  tint?: Tint;
  onClose: () => void;
};

export default function SessionDetail({ session, tint = 0, onClose }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const speakers = speakerEntries(session.speakers);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="detail-backdrop">
      <div
        className="detail"
        role="dialog"
        aria-modal="true"
        aria-labelledby="detail-title"
        data-tint={tint}
      >
        <h2 id="detail-title" className="detail-title">
          {session.title}
        </h2>
        <dl className="detail-facts">
          <div className="fact">
            <dt>Starts</dt>
            <dd className="detail-time">{session.time}</dd>
          </div>
          <div className="fact fact-wide">
            <dt>Room</dt>
            <dd className="detail-room">
              {session.track && <span className="dot" aria-hidden="true" />}
              {session.track || TBC}
            </dd>
          </div>
          <div className="fact fact-wide">
            <dt>Speakers</dt>
            <dd>
              {speakers.length === 0 ? (
                TBC
              ) : (
                <ul className="detail-speakers">
                  {speakers.map((entry) => (
                    <li key={entry} className="detail-speaker">
                      <AvatarStack names={speakerPeople(entry)} />
                      <span>{entry}</span>
                    </li>
                  ))}
                </ul>
              )}
            </dd>
          </div>
        </dl>
        <button ref={closeRef} type="button" className="pill detail-close" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
