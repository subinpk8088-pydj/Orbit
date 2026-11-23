import { generateData } from "./generate";

// Generated once per page load; dates are anchored to "now".
export const NOW = new Date();
export const { customers: CUSTOMERS, orders: ORDERS } = generateData(NOW);
export const CUSTOMER_BY_ID = new Map(CUSTOMERS.map((c) => [c.id, c]));
