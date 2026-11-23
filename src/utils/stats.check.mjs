import { generateData, HISTORY_DAYS } from "../data/generate.js";
import { categoryBreakdown, computeKpis, customerStats, dailySeries, isLive, topProducts } from "./stats.js";

const assert = (cond, msg) => {
  if (!cond) {
    console.error("FAIL:", msg);
    process.exit(1);
  }
  console.log("ok  :", msg);
};

const now = new Date("2025-03-15T10:00:00");
const { customers, orders } = generateData(now);
const again = generateData(now);

assert(JSON.stringify(orders) === JSON.stringify(again.orders), "data generation is deterministic");
assert(orders.length === 560 && customers.length === 40, "560 orders and 40 customers generated");
assert(new Set(orders.map((o) => o.id)).size === orders.length, "order IDs are unique");
assert(orders.every((o, i) => i === 0 || orders[i - 1].ts >= o.ts), "orders are sorted newest first");
assert(orders.every((o) => o.total === o.lines.reduce((s, l) => s + l.price * l.qty, 0)), "order total equals sum of its lines");
assert(orders.every((o) => o.daysAgo >= 0 && o.daysAgo < HISTORY_DAYS), "all orders fall inside the history window");

const custById = new Map(customers.map((c) => [c.id, c]));
assert(orders.every((o) => o.daysAgo <= custById.get(o.customerId).joinedDaysAgo), "no customer orders before they joined");
assert(orders.some((o) => o.status === "cancelled") && orders.some((o) => o.status === "processing"), "a mix of statuses exists");

for (const days of [7, 30, 90]) {
  const k = computeKpis(orders, customers, days, now);
  const live = orders.filter((o) => isLive(o) && o.daysAgo < days);
  assert(k.series.length === days, `${days}d: series has one row per day`);
  assert(k.revenue.value === live.reduce((s, o) => s + o.total, 0), `${days}d: revenue matches the live orders in range`);
  assert(k.orders.value === live.length, `${days}d: order count matches`);
  assert(Math.abs(k.aov.value - k.revenue.value / k.orders.value) < 1e-9, `${days}d: AOV = revenue / orders`);
  const cats = categoryBreakdown(orders, days);
  assert(cats.reduce((s, c) => s + c.value, 0) === k.revenue.value, `${days}d: category revenue adds up to total revenue`);
  const top = topProducts(orders, days, 5);
  assert(top.length <= 5 && top.every((p, i) => i === 0 || top[i - 1].revenue >= p.revenue), `${days}d: top products sorted by revenue`);
}

// Current and previous windows must tile the timeline with no overlap
const cur = dailySeries(orders, customers, 30, now, 0);
const prev = dailySeries(orders, customers, 30, now, 30);
assert(cur[0].daysAgo === 29 && cur.at(-1).daysAgo === 0, "current window runs from 29 days ago to today");
assert(prev[0].daysAgo === 59 && prev.at(-1).daysAgo === 30, "previous window is the 30 days before that");
assert(cur.at(-1).date.toDateString() === now.toDateString(), "last row is today");

const noCancelled = orders.filter((o) => o.status === "cancelled");
assert(noCancelled.length > 0 && dailySeries(noCancelled, [], 180, now).every((r) => r.revenue === 0), "cancelled orders never count as revenue");

const stats = customerStats(orders, customers);
const liveTotal = orders.filter(isLive).reduce((s, o) => s + o.total, 0);
assert(stats.reduce((s, c) => s + c.spent, 0) === liveTotal, "customer lifetime spend adds up to total live revenue");

const k30 = computeKpis(orders, customers, 30, now);
assert(k30.revenue.change === null || Number.isFinite(k30.revenue.change), "change % is a number or null when there is no prior period");
