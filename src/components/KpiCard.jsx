import { motion } from "framer-motion";
import { HiArrowDown, HiArrowUp } from "react-icons/hi";
import Sparkline from "./charts/Sparkline";
import { pct } from "../utils/format";

export default function KpiCard({ label, value, change, spark, index = 0 }) {
  const up = change !== null && change >= 0;
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }} className="card p-5">
      <p className="muted text-sm font-medium">{label}</p>
      <div className="mt-2 flex items-end justify-between gap-3">
        <p className="text-2xl font-extrabold tracking-tight">{value}</p>
        {change === null ? (
          <span className="muted text-xs">no prior data</span>
        ) : (
          <span
            className={`inline-flex items-center gap-0.5 rounded-full px-2 py-1 text-xs font-bold ${
              up ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400"
            }`}
          >
            {up ? <HiArrowUp /> : <HiArrowDown />}
            {pct(Math.abs(change)).replace("+", "")}
          </span>
        )}
      </div>
      <div className="mt-3">
        <Sparkline values={spark} />
      </div>
    </motion.div>
  );
}
