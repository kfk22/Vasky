import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/router";
import { formatPrice } from "../../lib/format";
import { OWNER_WHATSAPP, waLink, orderWhatsText } from "../../data/site";
import { useStore } from "../../lib/store";

export default function OrderDone({ order }) {
  const { addToCart } = useStore();
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [cancelMsg, setCancelMsg] = useState("");
  const [cancelled, setCancelled] = useState(false);
  const [reordering, setReordering] = useState(false);

  async function cancelOrder(e) {
    e.preventDefault();
    setCancelMsg("");
    const r = await fetch("/api/orders/cancel", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ number: order.number, phone }) });
    const d = await r.json();
    if (!r.ok) { setCancelMsg(d.error || "Failed"); return; }
    setCancelled(true);
  }

  async function orderAgain() {
    setReordering(true);
    try {
      const prods = await (await fetch("/api/products")).json();
      let added = 0;
      for (const i of order.items) {
        const p = prods.find((x) => x.id === i.id);
        const stock = p?.stock?.[i.size] ?? 0;
        if (p && stock > 0) { addToCart(p.id, i.size, Math.min(i.qty, stock), stock, { color: i.color }); added++; }
      }
      if (!added) { setCancelMsg("Those sizes are sold out now."); setReordering(false); return; }
      router.push("/cart");
    } catch { setReordering(false); }
  }
  if (!order) {
    return (
      <div className="wrap" style={{ padding: "60px 20px", textAlign: "center" }}>
        <h1 className="title">Order not found.</h1>
        <Link href="/shop" className="btn" style={{ display: "inline-block", marginTop: 16 }}>SHOP COLLECTION</Link>
      </div>
    );
  }
  const wa = waLink(OWNER_WHATSAPP, orderWhatsText(order));
  return (
    <div className="wrap" style={{ padding: "40px 20px 60px", maxWidth: 720 }}>
      <p className="kicker">ORDER CONFIRMED</p>
      <h1 className="title">Thank you, {order.customer.name.split(" ")[0]}.</h1>
      <p className="muted">Order <b style={{ color: "var(--brand)" }}>{order.number}</b> is received. We&apos;ll call {order.customer.phone} to confirm.</p>
      <div className="summary" style={{ position: "static", marginTop: 20 }}>
        {order.items.map((i) => (
          <div className="r" key={i.id + i.size}><span>{i.name} · EU {i.size} × {i.qty}</span><b>{formatPrice(i.total)}</b></div>
        ))}
        <div className="r"><span>Subtotal</span><b>{formatPrice(order.subtotal)}</b></div>
        {order.discount > 0 && <div className="r" style={{ color: "#1d8a3a" }}><span>Discount{order.promo ? " (" + order.promo + ")" : ""}</span><b>−{formatPrice(order.discount)}</b></div>}
        <div className="r"><span>Delivery</span><b>{order.delivery === 0 ? "Free" : formatPrice(order.delivery)}</b></div>
        <div className="r total"><span>Total</span><span>{formatPrice(order.total)}</span></div>
        <div className="r"><span>Status</span><span className="pill">{order.status}</span></div>
        <p className="muted">{order.customer.address}, {order.customer.city} · {order.paymentName}{order.whishRef ? " · ref " + order.whishRef : ""}</p>
        {order.payment === "whish" && (
          <p className="muted" style={{ background: "#fff5f6", border: "1px solid #f3c2cb", borderRadius: 10, padding: 12 }}>
            You chose <b>Whish Money</b> — pay <b>{formatPrice(order.total)}</b> when your order arrives. Nothing to send now.
            {order.whishRef ? <> Transaction ref: <b>{order.whishRef}</b>.</> : <> We&apos;ll confirm payment on delivery.</>}
          </p>
        )}
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
        <a className="btn wa-btn" href={wa} target="_blank" rel="noreferrer" style={{ background: "#1faa53", borderColor: "#1faa53" }}>
          <img src="/whatsapp.svg" alt="" width="19" height="19" /> CONFIRM ON WHATSAPP
        </a>
        <button className="btn ghost" onClick={orderAgain} disabled={reordering}>{reordering ? "ADDING…" : "ORDER AGAIN"}</button>
        <Link href="/shop" className="btn ghost">CONTINUE SHOPPING</Link>
      </div>
      <p className="muted" style={{ marginTop: 10 }}>Tap the green button — your order opens pre-written in WhatsApp, just press send.</p>
      {!cancelled && order.status === "Pending" && (
        <form onSubmit={cancelOrder} style={{ marginTop: 18, border: "1px dashed var(--line)", borderRadius: 12, padding: 16, maxWidth: 420 }}>
          <b>Changed your mind?</b>
          <p className="muted" style={{ margin: "6px 0" }}>Enter the phone number from this order to cancel it (pending orders only).</p>
          <div style={{ display: "flex", gap: 8 }}>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="03 123 456" aria-label="Order phone" style={{ flex: 1, border: "1px solid var(--line)", borderRadius: 8, padding: 10 }} />
            <button className="btn ghost">CANCEL ORDER</button>
          </div>
          {cancelMsg && <p className="err">{cancelMsg}</p>}
        </form>
      )}
      {cancelled && <p className="pill" style={{ marginTop: 18 }}>Order cancelled. Hope to see you again!</p>}
    </div>
  );
}

export async function getServerSideProps({ params }) {
  const { getOrders } = await import("../../lib/db");
  const order = (await getOrders()).find((o) => o.number === params.number) || null;
  return { props: { order } };
}
