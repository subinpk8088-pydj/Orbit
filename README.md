# Orbit — Sales Analytics Dashboard

A multi-page analytics dashboard for a small online store: KPIs with period-over-period change,
interactive charts, a sortable/filterable orders table with a detail drawer, a customers view,
and a settings page with light/dark/system theming.

**Stack:** Vite, React 18, React Router 6 (HashRouter), Tailwind CSS (dark mode via class), Framer Motion, react-icons.
No chart library: the area chart, donut and sparklines are hand-written SVG.

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # production build in /dist (works on any static host: hash routing, no rewrites needed)
npm run test:stats   # 32 checks on the analytics logic
npm run test:smoke   # server-renders every route + the order drawer to catch runtime errors
```

## Pages
- **Overview** — 7/30/90-day range; revenue, orders, avg. order value and new customers, each compared with the
  previous period; revenue area chart with hover tooltip; sales by category; top products; recent orders.
- **Orders** — search by ID or customer, status filters, sortable columns (customer, date, total), pagination,
  CSV export of the current filtered/sorted view, and a slide-over with items and a progress timeline
  (Esc or backdrop click to close; rows are keyboard-focusable).
- **Customers** — lifetime spend, order count and average order per customer; search and sort.
- **Settings** — theme (light / dark / system), store name, notification toggles. Saved in localStorage;
  the saved theme is applied before first paint so there's no light-mode flash.

## Demo data
`src/data/generate.js` builds 40 customers and 560 orders over 180 days from a fixed random seed, so the numbers are
identical every load (dates are anchored to today). Cancelled orders never count as revenue. Customers only order
after they join. Replace `src/data/store.js` with real API data to make it live; the rest of the app reads from there.

## Structure
- `src/utils/stats.js` — `computeKpis`, `dailySeries`, `categoryBreakdown`, `topProducts`, `customerStats` (pure functions)
- `src/utils/stats.check.mjs` — verifies determinism, that totals reconcile across KPIs/categories/customers,
  that current and previous windows tile without overlap, and that cancelled orders are excluded
- `scripts/smoke.mjs` — SSR render of all routes
- `src/components/` — `layout/AppShell`, `charts/` (AreaChart, Donut, Sparkline), `ui/` (Drawer, Pagination, StatusBadge, EmptyState), `KpiCard`
- `src/pages/`, `src/context/SettingsContext.jsx`, `src/hooks/useLocalStorage.js`

## Known limits
- "New customers" counts signups (a customer's join date), not first purchases.
- Charts aren't keyboard-navigable (the data is also in the tables); tooltips are pointer/touch only.
- Dates use the browser's local timezone.
