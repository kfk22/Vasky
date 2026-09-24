import Link from "next/link";

export default function Help() {
  return (
    <div className="wrap" style={{ padding: "34px 20px 60px", maxWidth: 760 }}>
      <p className="kicker">HELP</p>
      <h1 className="title">Delivery & returns</h1>

      <h3 style={{ color: "var(--brand)", marginTop: 26 }}>Delivery</h3>
      <p style={{ lineHeight: 1.8 }}>We deliver across Lebanon in 1–3 days. Fees depend on your area ($3–$6) and <b>delivery is free on orders over $75</b>. Pay in cash or with Whish Money when your order arrives — never in advance.</p>

      <h3 style={{ color: "var(--brand)", marginTop: 22 }}>Exchanges & returns</h3>
      <p style={{ lineHeight: 1.8 }}>Wrong size? Unworn shoes in original condition can be <b>exchanged within 3 days</b> of delivery. Message us on WhatsApp with your order number and we&apos;ll arrange the swap. Refunds are given as store credit or reversed Whish transfer.</p>

      <h3 style={{ color: "var(--brand)", marginTop: 22 }}>How to order</h3>
      <p style={{ lineHeight: 1.8 }}>1. Pick your size (check the size guide on any product). 2. Checkout with your name, phone and address. 3. We call to confirm, then your shoes are on the way. Track any order from the <Link href="/account"><u>Account</u></Link> page.</p>

      <h3 style={{ color: "var(--brand)", marginTop: 22 }}>Contact</h3>
      <p style={{ lineHeight: 1.8 }}>Questions? Chat with us on <a href="https://wa.me/96181283591" target="_blank" rel="noreferrer"><u>WhatsApp</u></a> — we reply fast.</p>

      <Link href="/shop" className="btn" style={{ display: "inline-block", marginTop: 20 }}>SHOP NOW</Link>
    </div>
  );
}
