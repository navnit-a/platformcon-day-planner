import { useEffect, useRef } from "react";
import type { Session } from "./schedule";

const TBC = "To be confirmed";

type Props = {
  session: Session;
  onClose: () => void;
};

export default function SessionDetail({ session, onClose }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const speakers = session.speakers
    .split(";")
    .map((name) => name.trim())
    .filter(Boolean);

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
      <div className="detail" role="dialog" aria-modal="true" aria-labelledby="detail-title">
        <h2 id="detail-title" className="detail-title">
          {session.title}
        </h2>
        <dl className="detail-facts">
          <dt>Starts</dt>
          <dd className="detail-time">{session.time}</dd>
          <dt>Room</dt>
          <dd>{session.track || TBC}</dd>
          <dt>Speakers</dt>
          <dd>
            {speakers.length === 0 ? (
              TBC
            ) : (
              <ul className="detail-speakers">
                {speakers.map((name) => (
                  <li key={name}>{name}</li>
                ))}
              </ul>
            )}
          </dd>
        </dl>
        <button ref={closeRef} type="button" className="pill" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
