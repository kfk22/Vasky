import { getOrders, setOrderStatus } from "../../../lib/db";

const digits = (s) => String(s || "").replace(/\D/g, "");
function samePhone(a, b) {
  a = digits(a); b = digits(b);
  if (a.length < 7 || b.length < 7) return false;
  return a.slice(-7) === b.slice(-7);
}

// POST { number, phone } — customer cancels their own PENDING order.
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { number, phone } = req.body || {};
  if (!number || !phone) return res.status(400).json({ error: "Missing details." });
  const o = (await getOrders()).find((x) => x.number === number);
  if (!o) return res.status(404).json({ error: "Order not found." });
  if (!samePhone(o.customer.phone, phone)) return res.status(403).json({ error: "Phone doesn't match this order." });
  if (o.status !== "Pending") return res.status(400).json({ error: "Only pending orders can be cancelled — message us on WhatsApp." });
  await setOrderStatus(number, "Cancelled");
  return res.status(200).json({ ok: true });
}
