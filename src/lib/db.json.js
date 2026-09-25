// Tiny file-JSON database for development.
// Swap these helpers with a real database later — API routes only use load/save.
import fs from "fs";
import path from "path";

const DIR = path.join(process.cwd(), ".data");

function ensure() {
  try { fs.mkdirSync(DIR, { recursive: true }); } catch {}
}

function file(name) {
  ensure();
  return path.join(DIR, name);
}

export function loadJson(name, fallback) {
  try {
    const raw = fs.readFileSync(file(name), "utf8");
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function saveJson(name, data) {
  try {
    fs.writeFileSync(file(name), JSON.stringify(data, null, 2), "utf8");
    return true;
  } catch {
    return false;
  }
}

// ---- orders ----
export function getOrders() {
  return loadJson("orders.json", []);
}

export function addOrder(order) {
  const orders = getOrders();
  orders.unshift(order);
  saveJson("orders.json", orders.slice(0, 500));
  return order;
}

export function setOrderStatus(number, status) {
  const orders = getOrders();
  const o = orders.find((x) => x.number === number);
  if (!o) return null;
  o.status = status;
  o.updatedAt = new Date().toISOString();
  saveJson("orders.json", orders);
  return o;
}

// ---- product overrides (admin edits) ----
export function getOverrides() {
  return loadJson("product-overrides.json", {});
}

export function setOverrides(next) {
  saveJson("product-overrides.json", next);
  return next;
}

// ---- delivery config ----
export function getDelivery() {
  return loadJson("delivery.json", null);
}

export function setDelivery(cfg) {
  saveJson("delivery.json", cfg);
  return cfg;
}

// ---- promo overrides ----
export function getPromos() {
  return loadJson("promos.json", null);
}

// ---- generic settings (admin password hash, etc.) ----
export function getSetting(key) {
  return loadJson("settings.json", {})[key] ?? null;
}

export function setSetting(key, value) {
  const s = loadJson("settings.json", {});
  s[key] = value;
  saveJson("settings.json", s);
  return value;
}

// ---- reviews ----
export function getReviews() {
  return loadJson("reviews.json", []);
}

export function addReview(r) {
  const all = getReviews();
  all.unshift(r);
  saveJson("reviews.json", all.slice(0, 1000));
  return r;
}
