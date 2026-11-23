import { useMemo, useState } from "react";
import { HiArrowDown, HiArrowUp, HiOutlineDownload, HiOutlineSearch } from "react-icons/hi";
import StatusBadge from "../components/ui/StatusBadge";
import Pagination from "../components/ui/Pagination";
import Drawer from "../components/ui/Drawer";
import EmptyState from "../components/ui/EmptyState";
import { CUSTOMER_BY_ID, ORDERS } from "../data/store";
import { downloadCsv } from "../utils/csv";
import { inr, longDate, shortDate } from "../utils/format";

const PAGE_SIZE = 10;
const STATUSES = ["all", "processing", "shipped", "delivered", "cancelled"];
const STAGES = ["Placed", "Processing", "Shipped", "Delivered"];
const STAGE_INDEX = { processing: 1, shipped: 2, delivered: 3 };

const customerOf = (o) => CUSTOMER_BY_ID.get(o.customerId);

function SortHeader({ label, sortKey, sort, onSort, align = "left" }) {
  const active = sort.key === sortKey;
  return (
    <th className={`py-3 font-semibold ${align === "right" ? "text-right" : "text-left"}`} aria-sort={active ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}>
      <button onClick={() => onSort(sortKey)} className={`inline-flex items-center gap-1 ${active ? "text-slate-900 dark:text-white" : ""}`}>
        {label}
        {active && (sort.dir === "asc" ? <HiArrowUp /> : <HiArrowDown />)}
      </button>
    </th>
  );
}

export function OrderDetail({ order }) {
  const c = customerOf(order);
  const stage = STAGE_INDEX[order.status] ?? 0;
  return (
    <div className="space-y-6 text-sm">
      <div className="flex items-center justify-between">
        <StatusBadge status={order.status} />
        <span className="muted">{longDate(order.ts)}</span>
      </div>

      <section>
        <h3 className="muted mb-2 text-xs font-semibold uppercase tracking-wider">Customer</h3>
        <p className="font-semibold">{c?.name}</p>
        <p className="muted">{c?.email}</p>
        <p className="muted">{c?.city}</p>
      </section>

      <section>
        <h3 className="muted mb-2 text-xs font-semibold uppercase tracking-wider">Items</h3>
        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
          {order.lines.map((l) => (
            <li key={l.productId} className="flex items-center justify-between py-3">
              <div>
                <p className="font-semibold">{l.name}</p>
                <p className="muted text-xs">{l.qty} × {inr(l.price)}</p>
              </div>
              <span className="font-semibold">{inr(l.qty * l.price)}</span>
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-base font-bold dark:border-slate-700">
          <span>Total</span>
          <span>{inr(order.total)}</span>
        </div>
      </section>

      <section>
        <h3 className="muted mb-3 text-xs font-semibold uppercase tracking-wider">Progress</h3>
        {order.status === "cancelled" ? (
          <p className="rounded-xl bg-rose-50 px-4 py-3 font-medium text-rose-700 dark:bg-rose-500/10 dark:text-rose-400">This order was cancelled.</p>
        ) : (
          <ol className="space-y-3">
            {STAGES.map((s, i) => (
              <li key={s} className="flex items-center gap-3">
                <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${i <= stage ? "bg-brand-600 text-white" : "bg-slate-200 text-slate-400 dark:bg-slate-800"}`}>
                  {i <= stage ? "✓" : i + 1}
                </span>
                <span className={i <= stage ? "font-semibold" : "muted"}>{s}</span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}

export default function Orders() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState({ key: "ts", dir: "desc" });
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = ORDERS.filter((o) => (status === "all" || o.status === status) && (!q || o.id.toLowerCase().includes(q) || customerOf(o)?.name.toLowerCase().includes(q)));
    const dir = sort.dir === "asc" ? 1 : -1;
    const get = { ts: (o) => o.ts, total: (o) => o.total, customer: (o) => customerOf(o)?.name ?? "" }[sort.key];
    return [...list].sort((a, b) => {
      const av = get(a);
      const bv = get(b);
      return (av < bv ? -1 : av > bv ? 1 : 0) * dir;
    });
  }, [query, status, sort]);

  const pageRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const onSort = (key) => {
    setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: key === "customer" ? "asc" : "desc" }));
    setPage(1);
  };

  const exportCsv = () =>
    downloadCsv("orders.csv", [
      ["Order", "Date", "Customer", "City", "Items", "Total (INR)", "Status"],
      ...rows.map((o) => [o.id, new Date(o.ts).toISOString(), customerOf(o)?.name, customerOf(o)?.city, o.lines.map((l) => `${l.qty}x ${l.name}`).join("; "), o.total, o.status]),
    ]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1 sm:max-w-sm">
          <HiOutlineSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-lg text-slate-400" />
          <input
            className="input pl-10"
            placeholder="Search order ID or customer"
            aria-label="Search orders"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by status">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => {
                setStatus(s);
                setPage(1);
              }}
              aria-pressed={status === s}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold capitalize transition ${status === s ? "bg-brand-600 text-white" : "bg-white ring-1 ring-slate-200 hover:bg-slate-100 dark:bg-slate-900 dark:ring-slate-700 dark:hover:bg-slate-800"}`}
            >
              {s}
            </button>
          ))}
        </div>
        <button onClick={exportCsv} className="btn btn-ghost ml-auto" disabled={rows.length === 0}>
          <HiOutlineDownload className="text-lg" /> Export CSV
        </button>
      </div>

      <div className="card overflow-hidden">
        {rows.length === 0 ? (
          <EmptyState title="No orders match" text="Try a different search or status filter." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="muted border-b border-slate-100 text-xs uppercase tracking-wider dark:border-slate-800">
                    <th className="px-6 py-3 text-left font-semibold">Order</th>
                    <SortHeader label="Customer" sortKey="customer" sort={sort} onSort={onSort} />
                    <SortHeader label="Date" sortKey="ts" sort={sort} onSort={onSort} />
                    <th className="py-3 text-left font-semibold">Items</th>
                    <SortHeader label="Total" sortKey="total" sort={sort} onSort={onSort} align="right" />
                    <th className="px-6 py-3 text-right font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((o) => (
                    <tr key={o.id} tabIndex={0} onClick={() => setSelected(o)} onKeyDown={(e) => e.key === "Enter" && setSelected(o)} className="cursor-pointer border-b border-slate-50 transition last:border-0 hover:bg-slate-50 focus:bg-slate-50 focus:outline-none dark:border-slate-800/60 dark:hover:bg-slate-800/50 dark:focus:bg-slate-800/50">
                      <td className="px-6 py-3.5 font-semibold">{o.id}</td>
                      <td className="py-3.5">{customerOf(o)?.name}</td>
                      <td className="muted py-3.5">{shortDate(o.ts)}</td>
                      <td className="muted py-3.5">{o.lines.reduce((s, l) => s + l.qty, 0)}</td>
                      <td className="py-3.5 text-right font-semibold">{inr(o.total)}</td>
                      <td className="px-6 py-3.5 text-right"><StatusBadge status={o.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} pageSize={PAGE_SIZE} total={rows.length} onChange={setPage} />
          </>
        )}
      </div>

      <Drawer open={!!selected} onClose={() => setSelected(null)} title={selected ? `Order ${selected.id}` : ""}>
        {selected && <OrderDetail order={selected} />}
      </Drawer>
    </div>
  );
}
