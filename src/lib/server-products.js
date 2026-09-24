// Server-side catalog: base products + admin overrides. Used by all API routes.
import { products as base } from "../data/products.js";
import { getOverrides, getDelivery } from "./db.js";
import { defaultDelivery } from "../data/delivery.js";

export async function catalog() {
  const over = (await getOverrides()) || {};
  return base.map((p) => {
    const o = over[p.id] || {};
    const merged = { ...p, ...o };
    if (o.stock) merged.stock = { ...p.stock, ...o.stock };
    return merged;
  });
}

export async function findProduct(idOrSlug) {
  return (await catalog()).find((p) => p.id === idOrSlug || p.slug === idOrSlug) || null;
}

export async function deliveryConfig() {
  return (await getDelivery()) || defaultDelivery;
}

export async function feeFor(areaId, subtotal) {
  const cfg = await deliveryConfig();
  if (subtotal >= (cfg.freeOver ?? 75)) return 0;
  const a = (cfg.areas || []).find((x) => x.id === areaId);
  return a ? Number(a.fee) || 0 : 5;
}
