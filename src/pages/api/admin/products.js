import { catalog } from "../../../lib/server-products";
import { getOverrides, setOverrides } from "../../../lib/db";
import { verifyAdmin } from "../../../lib/admin-auth";

export default async function handler(req, res) {
  if (!(await verifyAdmin(req))) return res.status(401).json({ error: "Unauthorized." });
  if (req.method === "GET") return res.status(200).json({ products: await catalog() });

  if (req.method === "POST") {
    // Create a new product: { product: { name, brand, price, category, sizes, description, img? } }
    const { product } = req.body || {};
    if (!product || typeof product.name !== "string" || !product.name.trim()) return res.status(400).json({ error: "Name required." });
    const price = Number(product.price);
    if (!(price > 0)) return res.status(400).json({ error: "Valid price required." });
    const sizes = (Array.isArray(product.sizes) ? product.sizes : String(product.sizes || "").split(",")).map((s) => String(s).trim()).filter(Boolean).slice(0, 20);
    if (!sizes.length) return res.status(400).json({ error: "At least one size required." });
    const category = ["men", "women", "kids"].includes(product.category) ? product.category : "men";
    const id = "cstm-" + Date.now().toString(36);
    let slug = product.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 50) || id;
    const existing = new Set((await catalog()).map((p) => p.slug));
    if (existing.has(slug)) slug += "-" + id.slice(-4);
    const stock = {};
    sizes.forEach((s) => { stock[s] = 5; });
    const over = (await getOverrides()) || {};
    over[id] = {
      __custom: true, id, slug,
      name: product.name.trim().slice(0, 80),
      brand: String(product.brand || "Vasky").slice(0, 40),
      price, oldPrice: null, category, sizes,
      colors: [{ name: "As shown", hex: "#8888aa" }],
      tags: ["new"], description: String(product.description || "").slice(0, 500),
      keywords: product.name, stock, rating: 5, reviews: 0,
      art: { style: "court", c1: "#e8e8f2", c2: "#2E2D88" },
    };
    if (typeof product.img === "string" && /^data:image\/(jpeg|png|webp);base64,/.test(product.img) && product.img.length <= 700000) {
      over[id].img = product.img;
    }
    await setOverrides(over);
    return res.status(201).json({ id, slug });
  }

  if (req.method === "PATCH") {
    // body: { id, patch } — patch may contain name, brand, price, oldPrice, stock {size:qty}, sizes, category, description, tags...
    const { id, patch } = req.body || {};
    if (!id || !patch || typeof patch !== "object") return res.status(400).json({ error: "Missing id/patch." });
    const clean = {};
    if (patch.name !== undefined) clean.name = String(patch.name).slice(0, 80);
    if (patch.brand !== undefined) clean.brand = String(patch.brand).slice(0, 40);
    if (patch.price !== undefined && patch.price !== "") clean.price = Math.max(0, Number(patch.price) || 0);
    if (patch.oldPrice !== undefined) clean.oldPrice = patch.oldPrice === "" || patch.oldPrice == null ? null : Math.max(0, Number(patch.oldPrice) || 0);
    if (patch.category !== undefined && ["men", "women", "kids"].includes(patch.category)) clean.category = patch.category;
    if (patch.description !== undefined) clean.description = String(patch.description).slice(0, 500);
    if (patch.sizes !== undefined) {
      const sizes = (Array.isArray(patch.sizes) ? patch.sizes : String(patch.sizes).split(",")).map((s) => String(s).trim()).filter(Boolean).slice(0, 20);
      if (sizes.length) clean.sizes = sizes;
    }
    const over = (await getOverrides()) || {};
    const cur = over[id] || {};
    const next = { ...over, [id]: { ...cur, ...clean } };
    if (patch.stock) next[id].stock = { ...(cur.stock || {}), ...patch.stock };
    if (typeof patch.img === "string" && /^data:image\/(jpeg|png|webp);base64,/.test(patch.img) && patch.img.length <= 700000) {
      next[id].img = patch.img;
    }
    await setOverrides(next);
    return res.status(200).json({ ok: true });
  }

  if (req.method === "DELETE") {
    const id = req.query.id || req.body?.id;
    if (!id) return res.status(400).json({ error: "Missing id." });
    const { products: base } = await import("../../../data/products.js");
    const over = (await getOverrides()) || {};
    if (base.some((p) => p.id === id)) {
      over[id] = { ...(over[id] || {}), deleted: true }; // hide base product
    } else {
      delete over[id]; // drop custom product entirely
    }
    await setOverrides(over);
    return res.status(200).json({ ok: true });
  }
  return res.status(405).json({ error: "Method not allowed" });
}
