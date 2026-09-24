// Promo codes. Admin can override via .data/promos.json (same shape).
// Server always re-validates — clients can't forge discounts.
export const defaultPromos = [
  { code: "WELCOME10", type: "percent", value: 10, minSubtotal: 0, note: "10% off your order" },
  { code: "FREESHIP", type: "freeship", value: 0, minSubtotal: 0, note: "Free delivery" },
];

export function applyPromo(promos, code, subtotal) {
  const p = (promos || []).find((x) => x.code === String(code || "").trim().toUpperCase());
  if (!p) return { ok: false, error: "Invalid code." };
  if (subtotal < (p.minSubtotal || 0)) return { ok: false, error: `Needs $${p.minSubtotal}+ subtotal.` };
  if (p.type === "percent") return { ok: true, promo: p, discount: Math.round(subtotal * (p.value / 100) * 100) / 100 };
  if (p.type === "freeship") return { ok: true, promo: p, discount: 0, freeShip: true };
  return { ok: false, error: "Invalid code." };
}
