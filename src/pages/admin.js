import { Fragment, useEffect, useState } from "react";
import { formatPrice } from "../lib/format";
import { ORDER_STATUSES } from "../data/delivery";

export default function Admin() {
  const [token, setToken] = useState("");
  const [in_, setIn] = useState(false);
  const [tab, setTab] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [delivery, setDelivery] = useState(null);
  const [msg, setMsg] = useState("");
  const [open, setOpen] = useState(null);
  const [edit, setEdit] = useState({});
  const [newArea, setNewArea] = useState({ id: "", name: "", fee: 5 });
  const [pwCur, setPwCur] = useState("");
  const [pwNext, setPwNext] = useState("");

  async function changePw(e) {
    e.preventDefault();
    const r = await fetch("/api/admin/password", {
      method: "POST",
      headers: headers(token),
      body: JSON.stringify({ current: pwCur, next: pwNext }),
    });
    const d = await r.json();
    if (!r.ok) { setMsg(d.error || "Failed"); return; }
    sessionStorage.setItem("vasky-admin", pwNext);
    setToken(pwNext); setPwCur(""); setPwNext("");
    setMsg("Password changed. Use the new one from now on.");
  }

  useEffect(() => { setToken(sessionStorage.getItem("vasky-admin") || ""); }, []);

  function headers(t) { return { "Content-Type": "application/json", "x-admin-token": t }; }

  async function login(e) {
    e.preventDefault();
    const t = token.trim();
    const r = await fetch("/api/admin/orders", { headers: { "x-admin-token": t } });
    if (!r.ok) { setMsg("Wrong token."); return; }
    sessionStorage.setItem("vasky-admin", t);
    setIn(true); setMsg("");
    load(t);
  }

  async function load(t) {
    const tk = t || token;
    const [o, p, d] = await Promise.all([
      fetch("/api/admin/orders", { headers: headers(tk) }).then((r) => r.json()),
      fetch("/api/admin/products", { headers: headers(tk) }).then((r) => r.json()),
      fetch("/api/admin/delivery", { headers: headers(tk) }).then((r) => r.json()),
    ]);
    if (o.orders) setOrders(o.orders);
    if (p.products) setProducts(p.products);
    if (d.areas) setDelivery(d);
  }

  async function setStatus(number, status) {
    await fetch("/api/admin/orders", { method: "PATCH", headers: headers(token), body: JSON.stringify({ number, status }) });
    load();
  }

  async function saveProduct(id) {
    const patch = {};
    if (edit[id]?.price !== undefined && edit[id].price !== "") patch.price = Number(edit[id].price);
    if (edit[id]?.oldPrice !== undefined) patch.oldPrice = edit[id].oldPrice === "" ? null : Number(edit[id].oldPrice);
    if (edit[id]?.stock !== undefined && edit[id].stock !== "") {
      const pairs = String(edit[id].stock).split(",").map((s) => s.trim()).filter(Boolean);
      const stock = {};
      pairs.forEach((pr) => { const [s, q] = pr.split(":"); if (s) stock[s.trim()] = Math.max(0, Number(q) || 0); });
      patch.stock = stock;
    }
    if (edit[id]?.discount !== undefined && edit[id].discount !== "") {
      const p = products.find((x) => x.id === id);
      const d = Math.min(90, Math.max(0, Number(edit[id].discount) || 0));
      patch.oldPrice = d === 0 ? null : Math.round(p.price / (1 - d / 100));
    }
    await fetch("/api/admin/products", { method: "PATCH", headers: headers(token), body: JSON.stringify({ id, patch }) });
    setMsg("Saved " + id);
    setEdit((e) => ({ ...e, [id]: {} }));
    load();
  }

  async function saveDelivery() {
    await fetch("/api/admin/delivery", { method: "PUT", headers: headers(token), body: JSON.stringify(delivery) });
    setMsg("Delivery saved");
  }

  if (!in_) {
    return (
      <div className="wrap" style={{ padding: "60px 20px", maxWidth: 460 }}>
        <p className="kicker">ADMIN</p>
        <h1 className="title">Dashboard login</h1>
        <p className="muted">Enter the admin token (ADMIN_TOKEN env, dev default shown in README).</p>
        <form onSubmit={login} style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <input type="password" value={token} onChange={(e) => setToken(e.target.value)} placeholder="Admin token" style={{ flex: 1, border: "1px solid var(--line)", borderRadius: 10, padding: 12 }} />
          <button className="btn">LOGIN</button>
        </form>
        {msg && <p className="err">{msg}</p>}
      </div>
    );
  }

  const customers = {};
  orders.forEach((o) => {
    const k = o.customer.phone;
    if (!customers[k]) customers[k] = { ...o.customer, orders: 0, spent: 0 };
    customers[k].orders++; customers[k].spent += o.total;
  });
  const live = orders.filter((o) => o.status !== "Cancelled");
  const revenue = live.reduce((s, o) => s + o.total, 0);
  const pending = orders.filter((o) => o.status === "Pending").length;
  const lowStock = [];
  products.forEach((p) => Object.entries(p.stock || {}).forEach(([s, q]) => { if (q <= 2) lowStock.push({ name: p.name, id: p.id, size: s, qty: q }); }));
  const waCust = (phone, text) => "https://wa.me/" + phone.replace(/\D/g, "") + "?text=" + encodeURIComponent(text);

  return (
    <div className="wrap admin-grid" style={{ maxWidth: 1160 }}>
      <nav className="admin-nav">
        {[["orders", "Orders"], ["products", "Products"], ["delivery", "Delivery"], ["customers", "Customers"], ["password", "Password"]].map(([v, l]) => (
          <button key={v} className={tab === v ? "sel" : ""} onClick={() => setTab(v)}>{l}</button>
        ))}
        <button onClick={() => { sessionStorage.removeItem("vasky-admin"); location.reload(); }}>Logout</button>
      </nav>
      <section>
        {msg && <p className="pill">{msg}</p>}
        <div className="stat-cards">
          <div className="stat"><b>{formatPrice(revenue)}</b><span>Revenue (excl. cancelled)</span></div>
          <div className="stat"><b>{orders.length}</b><span>Total orders</span></div>
          <div className="stat"><b>{pending}</b><span>Pending</span></div>
          <div className="stat"><b>{lowStock.length}</b><span>Low-stock sizes (≤2)</span></div>
        </div>
        {tab === "orders" && (
          <>
            <h2 style={{ color: "var(--brand)" }}>Orders ({orders.length})</h2>
            <div className="table-wrap"><table className="table">
              <thead><tr><th>Number</th><th>Customer</th><th>Total</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {orders.map((o) => (
                  <Fragment key={o.number}>
                    <tr key={o.number}>
                      <td><b>{o.number}</b><br /><span className="muted">{new Date(o.createdAt).toLocaleString()}</span></td>
                      <td>{o.customer.name}<br /><span className="muted">{o.customer.phone} · {o.customer.city}</span></td>
                      <td><b>{formatPrice(o.total)}</b></td>
                      <td>
                        <select value={o.status} onChange={(e) => setStatus(o.number, e.target.value)}>
                          {ORDER_STATUSES.map((s) => <option key={s}>{s}</option>)}
                        </select>
                      </td>
                      <td><button className="btn ghost" onClick={() => setOpen(open === o.number ? null : o.number)}>{open === o.number ? "HIDE" : "VIEW"}</button></td>
                    </tr>
                    {open === o.number && (
                      <tr><td colSpan={5}>
                        {o.items.map((i) => <p key={i.id + i.size} style={{ margin: "4px 0" }}>{i.name} · EU {i.size} × {i.qty} — {formatPrice(i.total)}</p>)}
                        <p className="muted">{o.customer.address}, {o.customer.city} ({o.customer.area}) · {o.customer.notes}</p>
                        <p className="muted">Pay: {o.paymentName}{o.whishRef ? " · Whish ref " + o.whishRef : ""} · Sub {formatPrice(o.subtotal)}{o.discount > 0 ? ` − ${formatPrice(o.discount)}${o.promo ? " (" + o.promo + ")" : ""}` : ""} + Del {formatPrice(o.delivery)}</p>
                        <a className="btn ghost" target="_blank" rel="noreferrer" href={waCust(o.customer.phone, `Hi ${o.customer.name}! This is Vasky about order ${o.number} (${o.status}).`)}>WHATSAPP CUSTOMER</a>
                      </td></tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table></div>
          </>
        )}
        {tab === "products" && (
          <>
            <h2 style={{ color: "var(--brand)" }}>Products ({products.length})</h2>
            {lowStock.length > 0 && (
              <p className="pill" style={{ background: "#fdeceb", color: "#b3261e" }}>
                Low stock: {lowStock.slice(0, 8).map((l) => `${l.name} EU${l.size} (${l.qty})`).join(" · ")}{lowStock.length > 8 ? ` +${lowStock.length - 8} more` : ""}
              </p>
            )}
            <div className="table-wrap"><table className="table">
              <thead><tr><th>Product</th><th>Price</th><th>Discount %</th><th>Stock (size:qty,…)</th><th></th></tr></thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td><b>{p.name}</b><br /><span className="muted">{p.id} · {p.brand} · {p.category}</span></td>
                    <td><input value={edit[p.id]?.price ?? p.price} onChange={(e) => setEdit((x) => ({ ...x, [p.id]: { ...x[p.id], price: e.target.value } }))} style={{ width: 70 }} /></td>
                    <td><input placeholder={p.oldPrice ? String(Math.round((1 - p.price / p.oldPrice) * 100)) : "0"} value={edit[p.id]?.discount ?? ""} onChange={(e) => setEdit((x) => ({ ...x, [p.id]: { ...x[p.id], discount: e.target.value } }))} style={{ width: 60 }} /></td>
                    <td><input value={edit[p.id]?.stock ?? Object.entries(p.stock || {}).map(([s, q]) => s + ":" + q).join(", ")} onChange={(e) => setEdit((x) => ({ ...x, [p.id]: { ...x[p.id], stock: e.target.value } }))} style={{ width: 220 }} /></td>
                    <td><button className="btn" onClick={() => saveProduct(p.id)}>SAVE</button></td>
                  </tr>
                ))}
              </tbody>
            </table></div>
          </>
        )}
        {tab === "delivery" && delivery && (
          <>
            <h2 style={{ color: "var(--brand)" }}>Delivery areas</h2>
            <label>Free over ($)<input type="number" value={delivery.freeOver} onChange={(e) => setDelivery({ ...delivery, freeOver: Number(e.target.value) })} /></label>
            <label style={{ display: "block", marginTop: 10 }}>Whish wallet number (shown at checkout)<input value={delivery.whish || ""} onChange={(e) => setDelivery({ ...delivery, whish: e.target.value })} placeholder="03 000 000" /></label>
            {delivery.areas.map((a, i) => (
              <div key={a.id} className="inputs" style={{ gridTemplateColumns: "1fr 2fr 1fr auto" }}>
                <input value={a.id} onChange={(e) => { const c = [...delivery.areas]; c[i] = { ...c[i], id: e.target.value }; setDelivery({ ...delivery, areas: c }); }} />
                <input value={a.name} onChange={(e) => { const c = [...delivery.areas]; c[i] = { ...c[i], name: e.target.value }; setDelivery({ ...delivery, areas: c }); }} />
                <input type="number" value={a.fee} onChange={(e) => { const c = [...delivery.areas]; c[i] = { ...c[i], fee: Number(e.target.value) }; setDelivery({ ...delivery, areas: c }); }} />
                <button className="btn ghost" onClick={() => setDelivery({ ...delivery, areas: delivery.areas.filter((_, j) => j !== i) })}>✕</button>
              </div>
            ))}
            <div className="inputs" style={{ gridTemplateColumns: "1fr 2fr 1fr auto" }}>
              <input placeholder="id" value={newArea.id} onChange={(e) => setNewArea({ ...newArea, id: e.target.value })} />
              <input placeholder="Name" value={newArea.name} onChange={(e) => setNewArea({ ...newArea, name: e.target.value })} />
              <input type="number" value={newArea.fee} onChange={(e) => setNewArea({ ...newArea, fee: Number(e.target.value) })} />
              <button className="btn" onClick={() => { if (newArea.id && newArea.name) { setDelivery({ ...delivery, areas: [...delivery.areas, newArea] }); setNewArea({ id: "", name: "", fee: 5 }); } }}>ADD</button>
            </div>
            <button className="btn" onClick={saveDelivery}>SAVE DELIVERY</button>
          </>
        )}
        {tab === "password" && (
          <>
            <h2 style={{ color: "var(--brand)" }}>Change password</h2>
            <p className="muted">Works right here on the website — no Vercel needed. 8+ characters.</p>
            <form onSubmit={changePw} style={{ display: "grid", gap: 10, maxWidth: 360 }}>
              <input type="password" value={pwCur} onChange={(e) => setPwCur(e.target.value)} placeholder="Current password" aria-label="Current password" style={{ border: "1px solid var(--line)", borderRadius: 8, padding: 10 }} />
              <input type="password" value={pwNext} onChange={(e) => setPwNext(e.target.value)} placeholder="New password" aria-label="New password" style={{ border: "1px solid var(--line)", borderRadius: 8, padding: 10 }} />
              <button className="btn">CHANGE PASSWORD</button>
            </form>
          </>
        )}
        {tab === "customers" && (
          <>
            <h2 style={{ color: "var(--brand)" }}>Customers ({Object.keys(customers).length})</h2>
            <div className="table-wrap"><table className="table">
              <thead><tr><th>Name</th><th>Contact</th><th>Orders</th><th>Spent</th></tr></thead>
              <tbody>
                {Object.values(customers).map((c) => (
                  <tr key={c.phone}><td>{c.name}</td><td>{c.phone}<br /><span className="muted">{c.city}</span></td><td>{c.orders}</td><td>{formatPrice(c.spent)}</td></tr>
                ))}
              </tbody>
            </table></div>
          </>
        )}
      </section>
    </div>
  );
}
