import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import KpiCard from "../components/KpiCard";
import AreaChart from "../components/charts/AreaChart";
import Donut, { PALETTE } from "../components/charts/Donut";
import StatusBadge from "../components/ui/StatusBadge";
import { CUSTOMER_BY_ID, CUSTOMERS, NOW, ORDERS } from "../data/store";
import { categoryBreakdown, computeKpis, topProducts } from "../utils/stats";
import { compactInr, inr, num, shortDate } from "../utils/format";

const RANGES = [7, 30, 90];

export default function Overview() {
  const [days, setDays] = useState(30);

  const { kpis, categories, products } = useMemo(
    () => ({
      kpis: computeKpis(ORDERS, CUSTOMERS, days, NOW),
      categories: categoryBreakdown(ORDERS, days),
      products: topProducts(ORDERS, days, 5),
    }),
    [days]
  );

  const chartData = kpis.series.map((r) => ({
    label: shortDate(r.date),
    value: r.revenue,
    sub: `${r.orders} order${r.orders === 1 ? "" : "s"}`,
  }));
  const maxProduct = Math.max(...products.map((p) => p.revenue), 1);
  const recent = ORDERS.slice(0, 6);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight">Welcome back</h2>
          <p className="muted text-sm">Here's how the store is doing compared with the previous {days} days.</p>
        </div>
        <div className="inline-flex rounded-xl bg-slate-200/70 p-1 dark:bg-slate-800" role="tablist" aria-label="Date range">
          {RANGES.map((r) => (
            <button
              key={r}
              role="tab"
              aria-selected={days === r}
              onClick={() => setDays(r)}
              className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition ${days === r ? "bg-white shadow-sm dark:bg-slate-700" : "muted"}`}
            >
              {r}d
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard index={0} label="Revenue" value={compactInr(kpis.revenue.value)} change={kpis.revenue.change} spark={kpis.revenue.spark} />
        <KpiCard index={1} label="Orders" value={num(kpis.orders.value)} change={kpis.orders.change} spark={kpis.orders.spark} />
        <KpiCard index={2} label="Avg. order value" value={inr(kpis.aov.value)} change={kpis.aov.change} spark={kpis.aov.spark} />
        <KpiCard index={3} label="New customers" value={num(kpis.newCustomers.value)} change={kpis.newCustomers.change} spark={kpis.newCustomers.spark} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="card p-6 lg:col-span-2">
          <div className="mb-4 flex items-baseline justify-between">
            <h3 className="font-bold">Revenue</h3>
            <span className="muted text-sm">{inr(kpis.revenue.value)} in {days} days</span>
          </div>
          <AreaChart data={chartData} formatValue={inr} formatAxis={compactInr} />
        </section>

        <section className="card p-6">
          <h3 className="mb-4 font-bold">Sales by category</h3>
          <Donut segments={categories} centerLabel="Total" centerValue={compactInr(kpis.revenue.value)} />
          <ul className="mt-5 space-y-2.5 text-sm">
            {categories.map((c, i) => (
              <li key={c.label} className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: PALETTE[i % PALETTE.length] }} />
                  {c.label}
                </span>
                <span className="font-semibold">{compactInr(c.value)}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="card p-6">
          <h3 className="mb-4 font-bold">Top products</h3>
          <ul className="space-y-4">
            {products.map((p) => (
              <li key={p.id}>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="truncate font-semibold">{p.name}</span>
                  <span className="shrink-0 font-bold">{compactInr(p.revenue)}</span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div className="h-full rounded-full bg-brand-500 transition-all duration-500" style={{ width: `${(p.revenue / maxProduct) * 100}%` }} />
                </div>
                <p className="muted mt-1 text-xs">{p.units} units · {p.category}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="card lg:col-span-2">
          <div className="flex items-center justify-between px-6 pb-2 pt-6">
            <h3 className="font-bold">Recent orders</h3>
            <Link to="/orders" className="text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400">View all</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-sm">
              <tbody>
                {recent.map((o) => (
                  <tr key={o.id} className="border-t border-slate-100 dark:border-slate-800">
                    <td className="px-6 py-3 font-semibold">{o.id}</td>
                    <td className="py-3">{CUSTOMER_BY_ID.get(o.customerId)?.name}</td>
                    <td className="muted py-3">{shortDate(o.ts)}</td>
                    <td className="py-3 text-right font-semibold">{inr(o.total)}</td>
                    <td className="px-6 py-3 text-right"><StatusBadge status={o.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
