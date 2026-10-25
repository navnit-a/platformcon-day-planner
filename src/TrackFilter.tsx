import { trackTint } from "./tints";

type Props = {
  tracks: string[];
  chosen: string | null;
  onChoose: (track: string) => void;
  onClear: () => void;
};

export default function TrackFilter({ tracks, chosen, onChoose, onClear }: Props) {
  return (
    <div className="filter-bar rise rise-5">
      <div className="filter-bar-inner shell">
        <div className="filters" role="group" aria-label="Filter by track">
          {tracks.map((track) => (
            <button
              key={track}
              type="button"
              className="filter"
              data-tint={trackTint(track, tracks)}
              aria-pressed={chosen === track}
              onClick={() => onChoose(track)}
            >
              <span className="dot" aria-hidden="true" />
              {track}
            </button>
          ))}
        </div>
        {chosen && (
          <button type="button" className="filter-clear" onClick={onClear}>
            Clear filter
          </button>
        )}
      </div>
    </div>
  );
}
