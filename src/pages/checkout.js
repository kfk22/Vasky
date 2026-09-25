import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { useStore } from "../lib/store";
import { formatPrice } from "../lib/format";
import { getProduct } from "../data/products";
import { defaultDelivery, PAYMENT_METHODS } from "../data/delivery";

const WHISH_LOGO = "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Logo_Whish_Money_%28Lebanon%29.png/250px-Logo_Whish_Money_%28Lebanon%29.png";

function WhishMark() {
  const [ok, setOk] = useState(true);
  if (!ok) return <b className="whish-badge">whish</b>;
  return <img src={WHISH_LOGO} alt="Whish" className="whish-logo" onError={() => setOk(false)} />;
}

export default function Checkout() {
  const { cart, clearCart, recordOrder, user } = useStore();
  const router = useRouter();
  const [areas, setAreas] = useState(defaultDelivery.areas);
  const [freeOver, setFreeOver] = useState(defaultDelivery.freeOver);
  const [whish, setWhish] = useState(defaultDelivery.whish);
  const [area, setArea] = useState("beirut");
  const [payment, setPayment] = useState("cod");
  const [whishRef, setWhishRef] = useState("");
  const [promo, setPromo] = useState("");
  const [promoMsg, setPromoMsg] = useState("");
  const [errs, setErrs] = useState({});
  const [placing, setPlacing] = useState(false);
  const [serverErr, setServerErr] = useState("");

  useEffect(() => {
    fetch("/api/delivery").then((r) => r.json()).then((d) => {
      if (d?.areas?.length) { setAreas(d.areas); setFreeOver(d.freeOver); }
      if (d?.whish) setWhish(d.whish);
    }).catch(() => {});
  }, []);

  const lines = useMemo(() => cart.map((i) => ({ ...i, product: getProduct(i.id) })).filter((l) => l.product), [cart]);
  const subtotal = lines.reduce((s, l) => s + l.product.price * l.qty, 0);
  const code = promo.trim().toUpperCase();
  // Client-side estimate only — server re-validates the code.
  let estDiscount = 0, estFreeShip = false, estPromoOk = false;
  if (code === "WELCOME10") { estDiscount = Math.round(subtotal * 0.1 * 100) / 100; estPromoOk = true; }
  if (code === "FREESHIP") { estFreeShip = true; estPromoOk = true; }
  const fee = estFreeShip ? 0 : subtotal - estDiscount >= freeOver ? 0 : (areas.find((a) => a.id === area)?.fee ?? 5);
  const total = subtotal - estDiscount + fee;

  async function submit(e) {
    e.preventDefault();
    setServerErr("");
    const fd = new FormData(e.currentTarget);
    const v = {
      name: String(fd.get("name") || "").trim(),
      phone: String(fd.get("phone") || "").trim(),
      email: String(fd.get("email") || "").trim(),
      address: String(fd.get("address") || "").trim(),
      city: String(fd.get("city") || "").trim(),
      notes: String(fd.get("notes") || "").trim(),
    };
    const er = {};
    if (v.name.length < 3) er.name = "Enter your full name.";
    if (!/^[+\d][\d\s/-]{5,}$/.test(v.phone)) er.phone = "Enter a valid phone number.";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.email)) er.email = "Enter a valid email.";
    if (v.address.length < 5) er.address = "Enter building + street.";
    if (v.city.length < 2) er.city = "Enter your city.";
    setErrs(er);
    if (Object.keys(er).length) return;
    setPlacing(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: { ...v, area },
          items: lines.map((l) => ({ id: l.product.id, size: l.size, qty: l.qty, color: l.color })),
          payment,
          promoCode: code || undefined,
          whishRef: payment === "whish" ? whishRef.trim() : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Order failed");
      recordOrder({ number: data.order.number, total: data.order.total, date: data.order.createdAt });
      clearCart();
      router.push("/order/" + data.order.number);
    } catch (err) {
      setServerErr(err.message);
    } finally {
      setPlacing(false);
    }
  }

  if (!lines.length) {
    return (
      <div className="wrap" style={{ padding: "60px 20px", textAlign: "center" }}>
        <h1 className="title">Your cart is empty.</h1>
        <Link href="/shop" className="btn" style={{ display: "inline-block", marginTop: 16 }}>SHOP COLLECTION</Link>
      </div>
    );
  }

  return (
    <div className="wrap" style={{ padding: "34px 20px 60px" }}>
      <p className="kicker">SECURE CHECKOUT</p>
      <h1 className="title">Delivery details</h1>
      <form onSubmit={submit} style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 22, marginTop: 18 }} className="co-grid">
        <div>
          <div className="form">
            <label>Full name<input name="name" defaultValue={user?.name || ""} placeholder="John Khoury" />{errs.name && <p className="err">{errs.name}</p>}</label>
            <label>Phone<input name="phone" placeholder="03 123 456" />{errs.phone && <p className="err">{errs.phone}</p>}</label>
            <label>Email<input name="email" type="email" defaultValue={user?.email || ""} placeholder="you@mail.com" />{errs.email && <p className="err">{errs.email}</p>}</label>
            <label>City<input name="city" placeholder="Beirut" />{errs.city && <p className="err">{errs.city}</p>}</label>
            <label className="full">Address<input name="address" placeholder="Building, street, floor" />{errs.address && <p className="err">{errs.address}</p>}</label>
            <label>Area
              <select value={area} onChange={(e) => setArea(e.target.value)}>
                {areas.map((a) => <option key={a.id} value={a.id}>{a.name} — ${a.fee}</option>)}
              </select>
            </label>
            <label>Notes (optional)<input name="notes" placeholder="Call on arrival…" /></label>
          </div>
          <h3 style={{ color: "var(--brand)", marginTop: 22 }}>Payment method</h3>
          {PAYMENT_METHODS.map((m) => (
            <div key={m.id}>
              <label className={"pay" + (payment === m.id ? " sel" : "")} style={{ display: "block" }}>
                <input type="radio" name="payment" checked={payment === m.id} onChange={() => setPayment(m.id)} />{" "}
                {m.id === "whish" ? <WhishMark /> : null} <b>{m.name}</b>
                <p className="muted" style={{ margin: "6px 0 0 22px" }}>{m.note}</p>
              </label>
              {m.id === "whish" && payment === "whish" && (
                <div style={{ margin: "10px 0 0 22px", display: "grid", gap: 8 }}>
                  <p style={{ margin: 0, fontSize: 14 }}>Pay <b>{formatPrice(total)}</b> to <b>{whish}</b> <b>when you receive your order</b> — nothing to send now. Already paid in advance? Paste the transaction ID:</p>
                  <input value={whishRef} onChange={(e) => setWhishRef(e.target.value)} placeholder="Transaction ID (only if already paid)" aria-label="Whish transaction ID (optional)" style={{ border: "1px solid var(--line)", borderRadius: 8, padding: 11, fontSize: 14 }} />
                </div>
              )}
            </div>
          ))}
          <div className="trust-row">
            <span>✓ No prepayment</span><span>✓ Pay at your door</span><span>✓ Track your order anytime</span>
          </div>
          {serverErr && <p className="err" style={{ marginTop: 12 }}>{serverErr}</p>}
        </div>
        <aside className="summary">
          {lines.map((l) => (
            <div className="r" key={l.id + l.size}><span>{l.product.name} · {l.size} × {l.qty}</span><b>{formatPrice(l.product.price * l.qty)}</b></div>
          ))}
          <div className="r"><span>Subtotal</span><b>{formatPrice(subtotal)}</b></div>
          <div className="promo-row">
            <input value={promo} onChange={(e) => { setPromo(e.target.value); setPromoMsg(""); }} placeholder="Promo code (try WELCOME10)" aria-label="Promo code" />
          </div>
          {code !== "" && (estPromoOk
            ? <div className="r" style={{ color: "#1d8a3a" }}><span>{code} applied</span><b>{estFreeShip ? "FREE delivery" : "−" + formatPrice(estDiscount)}</b></div>
            : <p className="err">Invalid code.</p>)}
          {promoMsg && <p className="err">{promoMsg}</p>}
          <div className="r"><span>Delivery</span><b>{fee === 0 ? "Free" : formatPrice(fee)}</b></div>
          <div className="r total"><span>Total</span><span>{formatPrice(total)}</span></div>
          <button className="btn" style={{ width: "100%", marginTop: 12 }} disabled={placing}>{placing ? "PLACING…" : "PLACE ORDER · " + formatPrice(total)}</button>
          <p className="muted" style={{ marginTop: 8 }}><Link href="/help"><u>Delivery & returns info</u></Link></p>
        </aside>
      </form>
      <style jsx>{`@media (max-width:1000px){.co-grid{grid-template-columns:1fr !important;}}`}</style>
    </div>
  );
}
