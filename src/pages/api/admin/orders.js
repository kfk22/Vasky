import { getOrders, setOrderStatus } from "../../../lib/db";
import { verifyAdmin } from "../../../lib/admin-auth";
import { ORDER_STATUSES } from "../../../data/delivery";

export default async function handler(req, res) {
  if (!(await verifyAdmin(req))) return res.status(401).json({ error: "Unauthorized." });
  if (req.method === "GET") {
    return res.status(200).json({ orders: await getOrders(), statuses: ORDER_STATUSES });
  }
  if (req.method === "PATCH") {
    const { number, status } = req.body || {};
    if (!ORDER_STATUSES.includes(status)) return res.status(400).json({ error: "Bad status." });
    const o = await setOrderStatus(number, status);
    if (!o) return res.status(404).json({ error: "Order not found." });
    return res.status(200).json({ order: o });
  }
  return res.status(405).json({ error: "Method not allowed" });
}
