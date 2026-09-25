import { getPromos, setPromos } from "../../../lib/db";
import { verifyAdmin } from "../../../lib/admin-auth";
import { defaultPromos } from "../../../data/promos";

function clean(list) {
  if (!Array.isArray(list)) return null;
  return list.slice(0, 20).map((p) => ({
    code: String(p.code || "").trim().toUpperCase().slice(0, 20),
    type: p.type === "freeship" ? "freeship" : "percent",
    value: Math.max(0, Number(p.value) || 0),
    minSubtotal: Math.max(0, Number(p.minSubtotal) || 0),
    note: String(p.note || "").slice(0, 80),
  })).filter((p) => p.code);
}

export default async function handler(req, res) {
  if (!(await verifyAdmin(req))) return res.status(401).json({ error: "Unauthorized." });
  if (req.method === "GET") return res.status(200).json({ promos: (await getPromos()) || defaultPromos });
  if (req.method === "PUT") {
    const list = clean(req.body?.promos);
    if (!list) return res.status(400).json({ error: "Bad promo list." });
    await setPromos(list);
    return res.status(200).json({ promos: list });
  }
  return res.status(405).json({ error: "Method not allowed" });
}
