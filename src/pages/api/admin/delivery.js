import { deliveryConfig } from "../../../lib/server-products";
import { setDelivery } from "../../../lib/db";
import { verifyAdmin } from "../../../lib/admin-auth";

export default async function handler(req, res) {
  if (!(await verifyAdmin(req))) return res.status(401).json({ error: "Unauthorized." });
  if (req.method === "GET") return res.status(200).json(await deliveryConfig());
  if (req.method === "PUT") {
    const { areas, freeOver, whish } = req.body || {};
    if (!Array.isArray(areas)) return res.status(400).json({ error: "Bad areas." });
    const cfg = {
      freeOver: Math.max(0, Number(freeOver) || 0),
      whish: String(whish || "").slice(0, 20),
      areas: areas.map((a) => ({ id: String(a.id), name: String(a.name).slice(0, 60), fee: Math.max(0, Number(a.fee) || 0) })).slice(0, 20),
    };
    await setDelivery(cfg);
    return res.status(200).json(cfg);
  }
  return res.status(405).json({ error: "Method not allowed" });
}
