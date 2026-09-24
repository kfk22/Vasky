import Link from "next/link";
import { useEffect, useState } from "react";
import { useStore } from "../lib/store";
import { formatPrice } from "../lib/format";
import { getProduct } from "../data/products";
import ProductImage from "../components/ProductImage";

export default function Cart() {
  const { cart, updateQty, removeItem } = useStore();
  const [freeOver, setFreeOver] = useState(75);
  useEffect(() => {
    fetch("/api/delivery").then((r) => r.json()).then((d) => { if (d?.freeOver != null) setFreeOver(d.freeOver); }).catch(() => {});
  }, []);
  const lines = cart.map((i) => ({ ...i, product: getProduct(i.id) })).filter((l) => l.product);
  const subtotal = lines.reduce((s, l) => s + l.product.price * l.qty, 0);
  const pct = Math.min(100, Math.round((subtotal / freeOver) * 100));

  if (!lines.length) {
    return (
      <div className="wrap" style={{ padding: "60px 20px", textAlign: "center" }}>
        <h1 className="title">Your cart is empty.</h1>
        <p className="muted">Every great outfit starts with the right pair.</p>
        <Link href="/shop" className="btn" style={{ display: "inline-block", marginTop: 16 }}>SHOP COLLECTION</Link>
      </div>
    );
  }

  return (
    <div className="wrap" style={{ padding: "34px 20px 60px" }}>
      <h1 className="title">Your cart</h1>
      <p className="muted">{lines.length} item(s) · {subtotal >= freeOver ? "you unlocked FREE delivery!" : `add ${formatPrice(freeOver - subtotal)} more for free delivery`}</p>
      <div className="ship-bar"><i style={{ width: pct + "%" }} /></div>
      <div className="split" style={{ marginTop: 18 }}>
        <div>
          {lines.map((l) => {
            const stock = l.product.stock?.[l.size] ?? 99;
            return (
              <div className="line" key={l.id + l.size}>
                <Link href={"/product/" + l.product.slug} className="thumb"><ProductImage product={l.product} /></Link>
                <div style={{ flex: 1 }}>
                  <b style={{ color: "var(--brand)" }}>{l.product.name}</b>
                  <p className="muted" style={{ margin: "4px 0" }}>EU {l.size}{l.color ? " · " + l.color : ""} · {formatPrice(l.product.price)}</p>
                  <div className="qty" style={{ margin: 0 }}>
                    <button onClick={() => updateQty(l.id, l.size, l.qty - 1, stock)} aria-label="Decrease">−</button>
                    <b>{l.qty}</b>
                    <button onClick={() => updateQty(l.id, l.size, l.qty + 1, stock)} aria-label="Increase" disabled={l.qty >= stock}>+</button>
                    {l.qty >= stock && <span className="muted">max stock</span>}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <b>{formatPrice(l.product.price * l.qty)}</b><br />
                  <button onClick={() => removeItem(l.id, l.size)} className="muted" style={{ background: "none", border: "none", textDecoration: "underline", fontSize: 12 }}>Remove</button>
                </div>
              </div>
            );
          })}
        </div>
        <aside className="summary">
          <div className="r"><span>Subtotal</span><b>{formatPrice(subtotal)}</b></div>
          <div className="r"><span>Delivery</span><span>at checkout</span></div>
          <div className="r total"><span>Total</span><span>{formatPrice(subtotal)}</span></div>
          <Link href="/checkout" className="btn" style={{ display: "block", textAlign: "center", marginTop: 14 }}>CHECKOUT →</Link>
          <Link href="/shop" className="btn ghost" style={{ display: "block", textAlign: "center", marginTop: 8 }}>CONTINUE SHOPPING</Link>
        </aside>
      </div>
    </div>
  );
}
