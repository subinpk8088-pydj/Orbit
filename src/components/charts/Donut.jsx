export const PALETTE = ["#0ea5e9", "#6366f1", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6"];

const R = 54;
const C = 2 * Math.PI * R;

/** segments: [{ label, value }]. Colours come from PALETTE by index so the legend can match. */
export default function Donut({ segments, centerLabel, centerValue }) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  let acc = 0;

  return (
    <div className="relative mx-auto h-48 w-48">
      <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90" role="img" aria-label="Sales by category">
        <circle cx="70" cy="70" r={R} fill="none" strokeWidth="16" className="stroke-slate-100 dark:stroke-slate-800" />
        {total > 0 &&
          segments.map((s, i) => {
            const len = (s.value / total) * C;
            const gap = segments.length > 1 ? 2 : 0;
            const el = (
              <circle
                key={s.label}
                cx="70"
                cy="70"
                r={R}
                fill="none"
                strokeWidth="16"
                stroke={PALETTE[i % PALETTE.length]}
                strokeDasharray={`${Math.max(len - gap, 0)} ${C - Math.max(len - gap, 0)}`}
                strokeDashoffset={-acc}
              />
            );
            acc += len;
            return el;
          })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="muted text-xs font-medium">{centerLabel}</span>
        <span className="text-xl font-extrabold">{centerValue}</span>
      </div>
    </div>
  );
}
