type SparklineProps = {
  points: { date: string; percentage: number; total: number }[];
  color?: string;
  height?: number;
  label?: string;
};

const WIDTH = 320;
const PAD = 6;

/**
 * Courbe d'évolution en SVG pur : aucun dépendance, aucun fetch, rendue
 * directement côté serveur. Les jours vides (0 manche) remontent à 0 %.
 */
export default function Sparkline({
  points,
  color = "#C7973E",
  height = 72,
  label = "Évolution du taux d'alignement",
}: SparklineProps) {
  if (points.length === 0) return null;

  const usableWidth = WIDTH - PAD * 2;
  const usableHeight = height - PAD * 2;
  const stepX = points.length === 1 ? 0 : usableWidth / (points.length - 1);

  const coords = points.map((point, index) => ({
    x: PAD + index * stepX,
    y: PAD + usableHeight - (point.percentage / 100) * usableHeight,
  }));

  const line = coords.map((coord, index) => `${index === 0 ? "M" : "L"}${coord.x} ${coord.y}`).join(" ");
  const area = `${line} L${coords[coords.length - 1].x} ${height - PAD} L${coords[0].x} ${height - PAD} Z`;

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${height}`}
      width="100%"
      height={height}
      role="img"
      aria-label={label}
      className="overflow-visible"
      preserveAspectRatio="none"
    >
      <line
        x1={PAD}
        y1={height - PAD}
        x2={WIDTH - PAD}
        y2={height - PAD}
        stroke="var(--color-line)"
        strokeWidth="1"
        strokeDasharray="3 4"
      />
      <path d={area} fill={color} fillOpacity="0.12" />
      <path d={line} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
