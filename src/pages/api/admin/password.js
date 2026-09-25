import { setSetting } from "../../../lib/db";
import { verifyAdmin, hashPassword } from "../../../lib/admin-auth";

// POST { current, next } — change the admin password from inside the dashboard.
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  if (!(await verifyAdmin(req))) return res.status(401).json({ error: "Wrong current password." });
  const next = String(req.body?.next || "");
  if (next.length < 8) return res.status(400).json({ error: "New password needs 8+ characters." });
  if (next.length > 100) return res.status(400).json({ error: "Too long." });
  await setSetting("admin-hash", hashPassword(next));
  return res.status(200).json({ ok: true });
}
