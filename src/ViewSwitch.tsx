export type View = "schedule" | "agenda" | "rooms";

type Props = {
  view: View;
  agendaCount: number;
  onChoose: (view: View) => void;
};

export default function ViewSwitch({ view, agendaCount, onChoose }: Props) {
  const views: { view: View; label: string }[] = [
    { view: "schedule", label: "Schedule" },
    { view: "agenda", label: `My agenda (${agendaCount})` },
    { view: "rooms", label: "Rooms" },
  ];
  return (
    <div className="view-switch shell rise rise-5" role="group" aria-label="View">
      {views.map((item) => (
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
