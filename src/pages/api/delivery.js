import { deliveryConfig } from "../../lib/server-products";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  res.status(200).json(await deliveryConfig());
}
