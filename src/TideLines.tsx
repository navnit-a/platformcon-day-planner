const LINE_COUNT = 13;
const FIRST_Y = 36;
const LINE_GAP = 44;

const tidePath = (index: number) => {
  const y = FIRST_Y + index * LINE_GAP;
  const swell = 14 + (index % 4) * 7;
  const drift = (index % 3) * 90;
  return `M-80 ${y} C ${220 + drift} ${y - swell}, ${500 + drift} ${y + swell}, ${780 + drift} ${y} S ${1260 + drift} ${y - swell}, 1560 ${y}`;
};

export default function TideLines() {
  return (
    <svg
      className="tide-lines"
      viewBox="0 0 1440 600"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      {Array.from({ length: LINE_COUNT }, (_, index) => (
        <path key={index} d={tidePath(index)} />
      ))}
    </svg>
  );
}
