// Deterministic demo data: the same shop, customers and orders every load.

export const PRODUCTS = [
  { id: "p1", name: "Aero Wireless Earbuds", category: "Audio", price: 3499 },
  { id: "p2", name: "Pulse Smartwatch", category: "Wearables", price: 7999 },
  { id: "p3", name: "Lumen Desk Lamp", category: "Home", price: 1899 },
  { id: "p4", name: "Nimbus Bluetooth Speaker", category: "Audio", price: 2799 },
  { id: "p5", name: "Terra Water Bottle", category: "Home", price: 799 },
  { id: "p6", name: "Flux 65W Fast Charger", category: "Accessories", price: 1499 },
  { id: "p7", name: "Orbit Laptop Sleeve", category: "Accessories", price: 1299 },
  { id: "p8", name: "Vista Action Cam", category: "Cameras", price: 11999 },
  { id: "p9", name: "Halo Ring Light", category: "Cameras", price: 2199 },
  { id: "p10", name: "Zen Yoga Mat", category: "Home", price: 1199 },
  { id: "p11", name: "Strata Fitness Band", category: "Wearables", price: 2499 },
  { id: "p12", name: "Echo Studio Headphones", category: "Audio", price: 8999 },
];

const NAMES = [
  "Anu Menon", "Rahul Nair", "Fathima Rasheed", "Kevin Thomas", "Divya Pillai", "Arjun Das", "Meera Suresh", "Sanjay Varma",
  "Priya Iyer", "Vishnu Kumar", "Neha Joseph", "Amal Krishnan", "Sreya Mohan", "Joel George", "Ayesha Khan", "Nikhil Raj",
  "Lakshmi Nair", "Faisal Ahmed", "Gayathri Das", "Tomy Mathew", "Aswin Babu", "Shilpa Menon", "Irfan Basheer", "Remya Pillai",
  "Hari Prasad", "Anjali Varma", "Basil Jacob", "Nandana Raj", "Mohammed Sinan", "Teena Philip", "Abhijith S", "Diya Sharma",
  "Roshan Cherian", "Keerthi Anand", "Jishnu Dev", "Alina Thomas", "Midhun Raj", "Sneha Kurian", "Navas Ali", "Parvathy Nair",
];
const CITIES = ["Kochi", "Kannur", "Thrissur", "Kozhikode", "Trivandrum", "Bengaluru", "Chennai", "Dubai"];

export const HISTORY_DAYS = 180;

function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function statusFor(daysAgo, r) {
  if (r < 0.05) return "cancelled";
  if (daysAgo > 10) return "delivered";
  if (daysAgo > 3) return r < 0.6 ? "delivered" : "shipped";
  return r < 0.5 ? "processing" : r < 0.93 ? "shipped" : "delivered";
}

/** @param {Date} now  anchor for dates. Everything else is seeded, so output only shifts with `now`. */
export function generateData(now = new Date(), orderCount = 560) {
  const rand = mulberry32(20240607);

  const customers = NAMES.map((name, i) => ({
    id: `c${i + 1}`,
    name,
    email: `${name.toLowerCase().replace(/[^a-z]+/g, ".")}@example.com`,
    city: CITIES[Math.floor(rand() * CITIES.length)],
    // skewed towards recent so signups look like growth
    joinedDaysAgo: Math.min(HISTORY_DAYS + 40, Math.floor(Math.pow(rand(), 1.4) * (HISTORY_DAYS + 40))),
  }));

  const raw = [];
  for (let i = 0; i < orderCount; i++) {
    const customer = customers[Math.floor(Math.pow(rand(), 1.7) * customers.length)];
    const horizon = Math.min(customer.joinedDaysAgo, HISTORY_DAYS - 1);
    const daysAgo = Math.floor(Math.pow(rand(), 1.35) * (horizon + 1));
    const lineCount = rand() < 0.6 ? 1 : rand() < 0.75 ? 2 : 3;
    const picked = new Set();
    const lines = [];
    while (lines.length < lineCount) {
      const product = PRODUCTS[Math.floor(Math.pow(rand(), 1.25) * PRODUCTS.length)];
      if (picked.has(product.id)) continue;
      picked.add(product.id);
      lines.push({ productId: product.id, name: product.name, category: product.category, price: product.price, qty: rand() < 0.8 ? 1 : 2 });
    }
    raw.push({ customerId: customer.id, daysAgo, minute: Math.floor(rand() * 1440), lines, statusRoll: rand() });
  }

  // number oldest-first so IDs grow with time, then return newest-first
  raw.sort((a, b) => b.daysAgo - a.daysAgo || a.minute - b.minute);
  const orders = raw.map((o, i) => {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - o.daysAgo);
    d.setMinutes(o.minute);
    return {
      id: `ORD-${1001 + i}`,
      customerId: o.customerId,
      daysAgo: o.daysAgo,
      ts: d.getTime(),
      lines: o.lines,
      total: o.lines.reduce((s, l) => s + l.price * l.qty, 0),
      status: statusFor(o.daysAgo, o.statusRoll),
    };
  });
  orders.reverse();

  return { customers, orders };
}
