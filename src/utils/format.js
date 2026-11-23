export const inr = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Math.round(n));

export const compactInr = (n) => `₹${new Intl.NumberFormat("en-IN", { notation: "compact", maximumFractionDigits: 1 }).format(n)}`;

export const num = (n) => new Intl.NumberFormat("en-IN").format(n);

export const shortDate = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

export const longDate = (d) =>
  new Date(d).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });

export const pct = (n) => `${n > 0 ? "+" : ""}${n.toFixed(1)}%`;

export const initials = (name) =>
  name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
