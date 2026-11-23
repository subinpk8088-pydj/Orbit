// Pure analytics helpers. Orders carry `daysAgo` (0 = today), so nothing here depends on the clock
// except labelling dates, which takes `now` explicitly.

export const isLive = (o) => o.status !== "cancelled";

const startOfDay = (now, daysAgo) => {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - daysAgo);
  return d;
};

/** One row per day, oldest first, for the window that ends `offsetDays` ago. Zero-filled. */
export function dailySeries(orders, customers, days, now, offsetDays = 0) {
  const rows = Array.from({ length: days }, (_, i) => {
    const daysAgo = offsetDays + (days - 1 - i);
    return { daysAgo, date: startOfDay(now, daysAgo), revenue: 0, orders: 0, newCustomers: 0 };
  });
  const byAgo = new Map(rows.map((r) => [r.daysAgo, r]));

  for (const o of orders) {
    if (!isLive(o)) continue;
    const row = byAgo.get(o.daysAgo);
    if (row) {
      row.revenue += o.total;
      row.orders += 1;
    }
  }
  for (const c of customers) {
    const row = byAgo.get(c.joinedDaysAgo);
    if (row) row.newCustomers += 1;
  }
  return rows;
}

const sum = (rows, key) => rows.reduce((s, r) => s + r[key], 0);
const change = (cur, prev) => (prev === 0 ? null : ((cur - prev) / prev) * 100);

/** Headline numbers for the last `days` days, each compared with the `days` before that. */
export function computeKpis(orders, customers, days, now) {
  const cur = dailySeries(orders, customers, days, now, 0);
  const prev = dailySeries(orders, customers, days, now, days);

  const make = (curVal, prevVal, spark) => ({ value: curVal, change: change(curVal, prevVal), spark });
  const aov = (rows) => (sum(rows, "orders") ? sum(rows, "revenue") / sum(rows, "orders") : 0);

  return {
    series: cur,
    revenue: make(sum(cur, "revenue"), sum(prev, "revenue"), cur.map((r) => r.revenue)),
    orders: make(sum(cur, "orders"), sum(prev, "orders"), cur.map((r) => r.orders)),
    aov: make(aov(cur), aov(prev), cur.map((r) => (r.orders ? r.revenue / r.orders : 0))),
    newCustomers: make(sum(cur, "newCustomers"), sum(prev, "newCustomers"), cur.map((r) => r.newCustomers)),
  };
}

const liveInRange = (orders, days) => orders.filter((o) => isLive(o) && o.daysAgo < days);

export function categoryBreakdown(orders, days) {
  const totals = new Map();
  for (const o of liveInRange(orders, days)) {
    for (const l of o.lines) totals.set(l.category, (totals.get(l.category) ?? 0) + l.price * l.qty);
  }
  return [...totals].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
}

export function topProducts(orders, days, n = 5) {
  const map = new Map();
  for (const o of liveInRange(orders, days)) {
    for (const l of o.lines) {
      const cur = map.get(l.productId) ?? { id: l.productId, name: l.name, category: l.category, units: 0, revenue: 0 };
      cur.units += l.qty;
      cur.revenue += l.price * l.qty;
      map.set(l.productId, cur);
    }
  }
  return [...map.values()].sort((a, b) => b.revenue - a.revenue).slice(0, n);
}

/** Per-customer lifetime stats (cancelled orders excluded). */
export function customerStats(orders, customers) {
  const map = new Map(customers.map((c) => [c.id, { ...c, orders: 0, spent: 0, lastDaysAgo: null }]));
  for (const o of orders) {
    if (!isLive(o)) continue;
    const c = map.get(o.customerId);
    if (!c) continue;
    c.orders += 1;
    c.spent += o.total;
    if (c.lastDaysAgo === null || o.daysAgo < c.lastDaysAgo) c.lastDaysAgo = o.daysAgo;
  }
  return [...map.values()];
}
