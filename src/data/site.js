// Site-wide store config.
export const OWNER_WHATSAPP = process.env.OWNER_WHATSAPP || "96181283591"; // +961 81 283 591
export const STORE_NAME = "Vasky";

export function waLink(phone, text) {
  return "https://wa.me/" + phone + "?text=" + encodeURIComponent(text);
}

export function orderWhatsText(order) {
  const lines = [
    "NEW VASKY ORDER " + order.number,
    ...order.items.map((i) => `- ${i.name} (EU ${i.size}) x${i.qty} — $${i.total.toFixed(2)}`),
    `Subtotal: $${order.subtotal.toFixed(2)}`,
    ...(order.discount ? [`Discount (${order.promo}): -$${order.discount.toFixed(2)}`] : []),
    `Delivery: ${order.delivery === 0 ? "FREE" : "$" + order.delivery.toFixed(2)}`,
    `TOTAL: $${order.total.toFixed(2)} (${order.paymentName})`,
    ...(order.whishRef ? [`Whish ref: ${order.whishRef}`] : []),
    `Name: ${order.customer.name}`,
    `Phone: ${order.customer.phone}`,
    `Address: ${order.customer.address}, ${order.customer.city} [${order.customer.area}]`,
  ];
  if (order.customer.notes) lines.push("Notes: " + order.customer.notes);
  return lines.join("\n");
}
