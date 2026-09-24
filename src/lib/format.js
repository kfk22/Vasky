export function formatPrice(n) {
  const v = Number(n) || 0;
  return "$" + v.toFixed(2);
}

export function orderNumber() {
  const d = new Date();
  const ymd = d.getFullYear().toString().slice(2) + String(d.getMonth() + 1).padStart(2, "0") + String(d.getDate()).padStart(2, "0");
  const rnd = Math.floor(1000 + Math.random() * 9000);
  return "VS-" + ymd + "-" + rnd;
}

export function clampQty(q, stock) {
  const n = Math.floor(Number(q)) || 1;
  return Math.max(1, Math.min(n, Math.max(1, stock)));
}
