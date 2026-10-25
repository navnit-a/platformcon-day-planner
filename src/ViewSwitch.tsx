export type View = "schedule" | "rooms";

type Props = {
  view: View;
  onChoose: (view: View) => void;
};

const VIEWS: { view: View; label: string }[] = [
  { view: "schedule", label: "Schedule" },
  { view: "rooms", label: "Rooms" },
];

export default function ViewSwitch({ view, onChoose }: Props) {
  return (
    <div className="view-switch shell rise rise-5" role="group" aria-label="View">
      {VIEWS.map((item) => (
        <button
          key={item.view}
          type="button"
          className="view-pill"
          aria-pressed={view === item.view}
          onClick={() => onChoose(item.view)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
