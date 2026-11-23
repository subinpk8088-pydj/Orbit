import { useId, useState } from "react";
import { motion } from "framer-motion";

const W = 800;
const H = 260;
const P = { t: 14, r: 14, b: 30, l: 56 };

function niceMax(v) {
  if (v <= 0) return 1;
  const exp = 10 ** Math.floor(Math.log10(v));
  const f = v / exp;
  const nice = f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10;
  return nice * exp;
}

/** data: [{ label, value, sub }]. Hand-drawn SVG: smooth line, gradient area, hover tooltip. */
export default function AreaChart({ data, formatValue, formatAxis }) {
  const gid = useId().replace(/:/g, "");
  const [hover, setHover] = useState(null);

  const n = data.length;
  const max = niceMax(Math.max(...data.map((d) => d.value), 0) * 1.05);
  const iw = W - P.l - P.r;
  const ih = H - P.t - P.b;
  const x = (i) => P.l + (n === 1 ? iw / 2 : (i / (n - 1)) * iw);
  const y = (v) => P.t + ih - (v / max) * ih;
  const pts = data.map((d, i) => [x(i), y(d.value)]);

  const line = pts
    .map(([px, py], i) => {
      if (i === 0) return `M${px},${py}`;
      const mx = (pts[i - 1][0] + px) / 2;
      return `C${mx},${pts[i - 1][1]} ${mx},${py} ${px},${py}`;
    })
    .join(" ");
  const area = `${line} L${pts[n - 1][0]},${P.t + ih} L${pts[0][0]},${P.t + ih} Z`;

  const ticks = [0, 1, 2, 3, 4].map((k) => (max * k) / 4);
  const labelCount = Math.min(6, n);
  const labelIdx = Array.from({ length: labelCount }, (_, k) => (labelCount === 1 ? 0 : Math.round((k * (n - 1)) / (labelCount - 1))));

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const sx = ((e.clientX - r.left) / r.width) * W;
    const i = n === 1 ? 0 : Math.round(((sx - P.l) / iw) * (n - 1));
    setHover(Math.max(0, Math.min(n - 1, i)));
  };

  const active = hover === null ? null : data[hover];
  const leftPct = hover === null ? 0 : (x(hover) / W) * 100;
  const topPct = hover === null ? 0 : (y(data[hover].value) / H) * 100;

  return (
    <div className="relative touch-pan-y select-none" onPointerMove={onMove} onPointerLeave={() => setHover(null)}>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full text-brand-500" role="img" aria-label="Revenue over time">
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.28" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>

        {ticks.map((t) => (
          <g key={t}>
            <line x1={P.l} x2={W - P.r} y1={y(t)} y2={y(t)} className="stroke-slate-200 dark:stroke-slate-800" strokeDasharray={t === 0 ? "0" : "3 4"} />
            <text x={P.l - 10} y={y(t) + 4} textAnchor="end" className="fill-slate-400 text-[11px]">
              {formatAxis(t)}
            </text>
          </g>
        ))}

        {labelIdx.map((i) => (
          <text key={i} x={x(i)} y={H - 8} textAnchor={i === 0 ? "start" : i === n - 1 ? "end" : "middle"} className="fill-slate-400 text-[11px]">
            {data[i].label}
          </text>
        ))}

        <g key={`${n}-${data[0].value}-${data[n - 1].value}`}>
          <motion.path d={area} fill={`url(#${gid})`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} />
          <motion.path d={line} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.9, ease: "easeOut" }} />
        </g>

        {hover !== null && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={P.t} y2={P.t + ih} className="stroke-slate-300 dark:stroke-slate-700" />
            <circle cx={x(hover)} cy={y(data[hover].value)} r="5" fill="currentColor" className="stroke-white dark:stroke-slate-900" strokeWidth="2.5" />
          </g>
        )}
      </svg>

      {active && (
        <div
          className="pointer-events-none absolute z-10 whitespace-nowrap rounded-lg bg-slate-900 px-3 py-2 text-xs text-white shadow-lg dark:bg-white dark:text-slate-900"
          style={{
            left: `${leftPct}%`,
            top: `${topPct}%`,
            transform: `translate(${leftPct > 80 ? "-100%" : leftPct < 20 ? "0%" : "-50%"}, -130%)`,
          }}
        >
          <p className="font-semibold">{active.label}</p>
          <p>{formatValue(active.value)}</p>
          {active.sub && <p className="opacity-70">{active.sub}</p>}
        </div>
      )}
    </div>
  );
}
