// Server-render every route (and the order drawer) to catch runtime errors that a build can't see.
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server.js";
import { createServer } from "vite";

let failed = 0;
const check = (cond, msg) => {
  console.log(`${cond ? "ok  " : "FAIL"}: ${msg}`);
  if (!cond) failed++;
};
const text = (html) => html.replace(/<!-- -->/g, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");

const vite = await createServer({ server: { middlewareMode: true }, appType: "custom", logLevel: "error" });
try {
  const { default: App } = await vite.ssrLoadModule("/src/App.jsx");
  const { OrderDetail } = await vite.ssrLoadModule("/src/pages/Orders.jsx");
  const { ORDERS } = await vite.ssrLoadModule("/src/data/store.js");

  const render = (path) => renderToString(createElement(StaticRouter, { location: path }, createElement(App)));

  const routes = {
    "/": ["Welcome back", "Revenue", "Avg. order value", "Sales by category", "Top products", "Recent orders"],
    "/orders": ["Export CSV", "Showing 1–10 of 560", "Order", "Customer"],
    "/customers": ["Repeat buyers", "Lifetime revenue", "Top spenders"],
    "/settings": ["Appearance", "Store name", "Notifications", "New order alerts"],
    "/does-not-exist": ["404"],
  };

  for (const [path, expected] of Object.entries(routes)) {
    let out = "";
    try {
      out = text(render(path));
    } catch (err) {
      check(false, `${path} renders without throwing (${err.message})`);
      continue;
    }
    check(true, `${path} renders without throwing`);
    for (const s of expected) check(out.includes(s), `${path} contains "${s}"`);
  }

  const ordersHtml = render("/orders");
  check(ordersHtml.includes('placeholder="Search order ID or customer"'), "/orders has the search input");
  const tbody = ordersHtml.split("<tbody")[1]?.split("</tbody>")[0] ?? "";
  check((tbody.match(/<tr[ >]/g) ?? []).length === 10, "/orders renders exactly one page of 10 body rows");

  const normal = ORDERS.find((o) => o.status === "delivered");
  const cancelled = ORDERS.find((o) => o.status === "cancelled");
  const d1 = text(renderToString(createElement(OrderDetail, { order: normal })));
  check(d1.includes(normal.lines[0].name) && d1.includes("Progress") && d1.includes("Delivered"), "order drawer shows items and the progress timeline");
  const d2 = text(renderToString(createElement(OrderDetail, { order: cancelled })));
  check(d2.includes("This order was cancelled"), "cancelled orders show the cancelled notice instead of a timeline");
} finally {
  await vite.close();
}

if (failed) {
  console.error(`\n${failed} check(s) failed`);
  process.exit(1);
}
console.log("\nAll smoke checks passed");
