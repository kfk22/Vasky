// Owner notifications for new orders.
//
// TWO PATHS:
// 1. Automatic (needs setup): Meta WhatsApp Cloud API. Set WHATSAPP_TOKEN +
//    WHATSAPP_PHONE_ID env vars and every order is pushed to OWNER_WHATSAPP.
// 2. One-tap (works today, zero setup): the ORDER CONFIRMED page shows a
//    "Confirm on WhatsApp" button (wa.me link with the full order pre-filled).
//    Customer taps it, presses send — the order lands on your phone.
import { orderWhatsText } from "../data/site.js";

export async function notifyOwner(order) {
  const to = process.env.OWNER_WHATSAPP || "96181283591";
  const text = orderWhatsText(order);
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;

  if (token && phoneId) {
    try {
      const r = await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
        method: "POST",
        headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
        body: JSON.stringify({ messaging_product: "whatsapp", to, type: "text", text: { body: text } }),
      });
      if (r.ok) return { sent: true, via: "whatsapp-cloud" };
      console.warn("[notify] cloud api failed:", await r.text());
    } catch (e) {
      console.warn("[notify] cloud api error:", e.message);
    }
  }
  // Fallback: server log (visible in hosting dashboards / `next start` output).
  console.log(`[new-order for ${to}]\n${text}`);
  return { sent: false, via: "log" };
}
