import { findProduct, feeFor } from "../../lib/server-products";
import { addOrder, getOrders, getOverrides, setOverrides, getPromos } from "../../lib/db";
import { orderNumber } from "../../lib/format";
import { defaultPromos, applyPromo } from "../../data/promos";
import { notifyOwner } from "../../lib/notify";

const hits = new Map(); // ip -> timestamps (simple abuse throttle)
function throttled(ip) {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < 60000);
  arr.push(now);
  hits.set(ip, arr);
  return arr.length > 12;
}

function bad(res, msg) { return res.status(400).json({ error: msg }); }

export default async function handler(req, res) {
  if (req.method === "POST" && throttled(req.socket?.remoteAddress || "x")) {
    return res.status(429).json({ error: "Too many tries — wait a minute." });
  }
  if (req.method === "GET") {
    // lookup by number (for account order tracking)
    const { number } = req.query;
    if (!number) return bad(res, "Missing order number.");
    const o = (await getOrders()).find((x) => x.number === number);
    if (!o) return res.status(404).json({ error: "Order not found." });
    return res.status(200).json({ order: { number: o.number, status: o.status, total: o.total, createdAt: o.createdAt } });
  }
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { customer, items, payment, promoCode } = req.body || {};
  if (!customer || !items) return bad(res, "Missing order data.");
  const name = String(customer.name || "").trim();
  const phone = String(customer.phone || "").trim();
  const email = String(customer.email || "").trim();
  const address = String(customer.address || "").trim();
  const city = String(customer.city || "").trim();
  const area = String(customer.area || "beirut");
  if (name.length < 3) return bad(res, "Full name is required.");
  if (!/^[+\d][\d\s/-]{5,}$/.test(phone)) return bad(res, "Valid phone is required.");
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return bad(res, "Valid email is required.");
  if (address.length < 5) return bad(res, "Address is required.");
  if (city.length < 2) return bad(res, "City is required.");
  if (!Array.isArray(items) || !items.length || items.length > 20) return bad(res, "Cart is empty or too large.");
  if (!["cod", "whish"].includes(payment)) return bad(res, "Unsupported payment method.");
  const whishRef = String(req.body.whishRef || "").trim().slice(0, 40);
  // Whish is pay-on-delivery: a ref is only required if the customer prepaid.
  if (payment === "whish" && whishRef && whishRef.length < 4) return bad(res, "That transaction ID looks too short.");

  // Server-side price + stock validation. Never trust client totals.
  const overrides = (await getOverrides()) || {};
  const lines = [];
  let subtotal = 0;
  for (const it of items) {
    const p = await findProduct(it.id);
    if (!p) return bad(res, "Unknown product.");
    const size = String(it.size || "");
    if (!p.sizes.includes(size)) return bad(res, `${p.name}: size ${size} unavailable.`);
    const qty = Math.floor(Number(it.qty)) || 0;
    if (qty < 1 || qty > 20) return bad(res, `${p.name}: invalid quantity.`);
    const stock = (p.stock || {})[size] ?? 0;
    if (qty > stock) return bad(res, `${p.name} (EU ${size}): only ${stock} left.`);
    const total = p.price * qty;
    subtotal += total;
    lines.push({ id: p.id, name: p.name, brand: p.brand, size, qty, price: p.price, total, color: it.color || (p.colors[0] || {}).name || "" });
  }
  // Promo code — validated here, never trusted from the client.
  let discount = 0, promo = null, freeShip = false;
  if (promoCode) {
    const list = (await getPromos()) || defaultPromos;
    const applied = applyPromo(list, promoCode, subtotal);
    if (!applied.ok) return bad(res, applied.error);
    promo = applied.promo.code;
    discount = applied.discount || 0;
    freeShip = !!applied.freeShip;
  }
  const delivery = freeShip ? 0 : await feeFor(area, subtotal - discount);
  const total = subtotal - discount + delivery;

  // decrement stock via overrides
  const next = { ...overrides };
  for (const l of lines) {
    const p = await findProduct(l.id);
    const cur = (p.stock || {})[l.size] ?? 0;
    next[l.id] = { ...(next[l.id] || {}), stock: { ...((next[l.id] || {}).stock || {}), [l.size]: cur - l.qty } };
  }
  await setOverrides(next);

  const order = {
    number: orderNumber(),
    customer: { name, phone, email, address, city, area, notes: String(customer.notes || "").slice(0, 300) },
    items: lines,
    payment,
    paymentName: payment === "whish" ? "Whish Money" : "Cash on Delivery",
    whishRef: payment === "whish" ? whishRef : null,
    subtotal, discount: discount || 0, promo: promo || null, delivery, total,
    status: "Pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await addOrder(order);
  // WhatsApp alert to the owner — fire-and-forget, never blocks the order.
  notifyOwner(order).catch(() => {});
  res.status(201).json({ order });
}
