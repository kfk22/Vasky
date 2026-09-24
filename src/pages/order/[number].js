import Link from "next/link";
import { formatPrice } from "../../lib/format";
import { OWNER_WHATSAPP, waLink, orderWhatsText } from "../../data/site";

export default function OrderDone({ order }) {
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
        <a className="btn" href={wa} target="_blank" rel="noreferrer" style={{ background: "#1faa53", borderColor: "#1faa53" }}>CONFIRM ON WHATSAPP</a>
        <Link href="/shop" className="btn ghost">CONTINUE SHOPPING</Link>
      </div>
      <p className="muted" style={{ marginTop: 10 }}>Tap the green button — your order opens pre-written in WhatsApp, just press send.</p>
    </div>
  );
}

export async function getServerSideProps({ params }) {
  const { getOrders } = await import("../../lib/db");
  const order = (await getOrders()).find((o) => o.number === params.number) || null;
  return { props: { order } };
}
