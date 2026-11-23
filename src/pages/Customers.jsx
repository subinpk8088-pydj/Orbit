import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { HiOutlineSearch } from "react-icons/hi";
import EmptyState from "../components/ui/EmptyState";
import { CUSTOMERS, ORDERS } from "../data/store";
import { customerStats } from "../utils/stats";
import { compactInr, initials, inr } from "../utils/format";

const SORTS = {
  spent: { label: "Top spenders", fn: (a, b) => b.spent - a.spent },
  orders: { label: "Most orders", fn: (a, b) => b.orders - a.orders },
  recent: { label: "Recently active", fn: (a, b) => (a.lastDaysAgo ?? 9999) - (b.lastDaysAgo ?? 9999) },
};
const HUES = [199, 239, 160, 38, 330, 262];

const lastSeen = (d) => (d === null ? "No orders yet" : d === 0 ? "Today" : d === 1 ? "Yesterday" : `${d} days ago`);

export default function Customers() {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("spent");
  const all = useMemo(() => customerStats(ORDERS, CUSTOMERS), []);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all.filter((c) => !q || c.name.toLowerCase().includes(q) || c.city.toLowerCase().includes(q)).sort(SORTS[sort].fn);
  }, [all, query, sort]);

  const totalSpent = all.reduce((s, c) => s + c.spent, 0);
  const repeat = all.filter((c) => c.orders > 1).length;

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ["Customers", all.length],
          ["Repeat buyers", `${repeat} (${Math.round((repeat / all.length) * 100)}%)`],
          ["Lifetime revenue", compactInr(totalSpent)],
        ].map(([label, value]) => (
          <div key={label} className="card p-5">
            <p className="muted text-sm font-medium">{label}</p>
            <p className="mt-1 text-2xl font-extrabold tracking-tight">{value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1 sm:max-w-sm">
          <HiOutlineSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-lg text-slate-400" />
          <input className="input pl-10" placeholder="Search by name or city" aria-label="Search customers" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <select className="input w-auto" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort customers">
          {Object.entries(SORTS).map(([key, s]) => (
            <option key={key} value={key}>{s.label}</option>
          ))}
        </select>
      </div>

      {list.length === 0 ? (
        <div className="card"><EmptyState title="No customers found" text="Try a different search." /></div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((c, i) => {
            const hue = HUES[Number(c.id.slice(1)) % HUES.length];
            return (
              <motion.article key={c.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.02, 0.3) }} className="card p-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white" style={{ background: `hsl(${hue} 70% 45%)` }} aria-hidden="true">
                    {initials(c.name)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-bold">{c.name}</p>
                    <p className="muted truncate text-xs">{c.city} · {c.email}</p>
                  </div>
                </div>
                <dl className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
                  <div className="rounded-xl bg-slate-50 py-2 dark:bg-slate-800/60">
                    <dt className="muted text-[11px]">Orders</dt>
                    <dd className="font-bold">{c.orders}</dd>
                  </div>
                  <div className="rounded-xl bg-slate-50 py-2 dark:bg-slate-800/60">
                    <dt className="muted text-[11px]">Spent</dt>
                    <dd className="font-bold">{compactInr(c.spent)}</dd>
                  </div>
                  <div className="rounded-xl bg-slate-50 py-2 dark:bg-slate-800/60">
                    <dt className="muted text-[11px]">Avg.</dt>
                    <dd className="font-bold">{c.orders ? inr(c.spent / c.orders) : "–"}</dd>
                  </div>
                </dl>
                <p className="muted mt-3 text-xs">Last order: {lastSeen(c.lastDaysAgo)}</p>
              </motion.article>
            );
          })}
        </div>
      )}
    </div>
  );
}
