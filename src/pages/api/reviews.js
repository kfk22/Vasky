import { getReviews, addReview } from "../../lib/db";

const esc = (s) => String(s || "").trim().slice(0, 500);

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { product } = req.query;
    const all = await getReviews();
    return res.status(200).json({ reviews: product ? all.filter((r) => r.productId === product).slice(0, 30) : all.slice(0, 30) });
  }
  if (req.method === "POST") {
    const { productId, name, rating, text } = req.body || {};
    if (!productId) return res.status(400).json({ error: "Missing product." });
    const r = Math.round(Number(rating));
    if (!(r >= 1 && r <= 5)) return res.status(400).json({ error: "Rating 1-5." });
    if (esc(name).length < 2) return res.status(400).json({ error: "Enter your name." });
    if (esc(text).length < 4) return res.status(400).json({ error: "Write a few words." });
    const review = { productId: String(productId), name: esc(name).slice(0, 60), rating: r, text: esc(text).slice(0, 500), createdAt: new Date().toISOString() };
    await addReview(review);
    return res.status(201).json({ review });
  }
  return res.status(405).json({ error: "Method not allowed" });
}
