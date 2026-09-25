import { catalog } from "../../../lib/server-products";
import { getOverrides, setOverrides } from "../../../lib/db";
import { verifyAdmin } from "../../../lib/admin-auth";

export default async function handler(req, res) {
  if (!(await verifyAdmin(req))) return res.status(401).json({ error: "Unauthorized." });
  if (req.method === "GET") return res.status(200).json({ products: await catalog() });

  if (req.method === "PATCH" || req.method === "POST") {
    // body: { id, patch } — patch may contain price, oldPrice, stock {size:qty}, sizes, colors, name, tags...
    const { id, patch } = req.body || {};
    if (!id || !patch) return res.status(400).json({ error: "Missing id/patch." });
    const over = (await getOverrides()) || {};
    const cur = over[id] || {};
    const next = { ...over, [id]: { ...cur, ...patch } };
    if (patch.stock) next[id].stock = { ...(cur.stock || {}), ...patch.stock };
    await setOverrides(next);
    return res.status(200).json({ ok: true });
  }
  return res.status(405).json({ error: "Method not allowed" });
}
