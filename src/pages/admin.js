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
  const [promos, setPromos] = useState([]);
  const [newPromo, setNewPromo] = useState({ code: "", type: "percent", value: 10 });
  const [reviews, setReviews] = useState([]);
  const [np, setNp] = useState({ name: "", brand: "Vasky", price: "", category: "men", sizes: "", description: "" });
  const [npImg, setNpImg] = useState("");
  const [oSearch, setOSearch] = useState("");
  const [oFilter, setOFilter] = useState("all");

  const escH = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  function exportCSV() {
    const rows = [["number", "date", "name", "phone", "city", "area", "items", "subtotal", "discount", "delivery", "total", "payment", "status"]];
    orders.forEach((o) => rows.push([o.number, o.createdAt, o.customer.name, o.customer.phone, o.customer.city, o.customer.area, o.items.map((i) => `${i.name} EU${i.size} x${i.qty}`).join("; "), o.subtotal, o.discount || 0, o.delivery, o.total, o.paymentName, o.status]));
    const csv = rows.map((r) => r.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "vasky-orders.csv";
    a.click();
  }

  function printInvoice(o) {
    const w = window.open("", "_blank", "width=640");
    if (!w) { setMsg("Allow popups to print invoices."); return; }
    w.document.write(`<html><head><title>Invoice ${escH(o.number)}</title><style>body{font-family:Arial,sans-serif;padding:24px;color:#111}table{width:100%;border-collapse:collapse;margin:12px 0}td,th{border:1px solid #999;padding:7px;text-align:left;font-size:13px}</style></head><body>
      <h2 style="letter-spacing:4px">VASKY</h2>
      <p>Order <b>${escH(o.number)}</b> · ${escH(new Date(o.createdAt).toLocaleString())} · ${escH(o.status)}</p>
      <p>${escH(o.customer.name)} · ${escH(o.customer.phone)}<br>${escH(o.customer.address)}, ${escH(o.customer.city)}</p>
      <table><tr><th>Item</th><th>Size</th><th>Qty</th><th>Total</th></tr>${o.items.map((i) => `<tr><td>${escH(i.name)}</td><td>${escH(i.size)}</td><td>${i.qty}</td><td>$${Number(i.total).toFixed(2)}</td></tr>`).join("")}</table>
      <p>Subtotal $${Number(o.subtotal).toFixed(2)}${o.discount ? ` · Discount -$${Number(o.discount).toFixed(2)}` : ""} · Delivery ${o.delivery === 0 ? "Free" : "$" + Number(o.delivery).toFixed(2)}</p>
      <h3>Total $${Number(o.total).toFixed(2)} (${escH(o.paymentName)})</h3>
      <script>onload=()=>{print();}<\/script></body></html>`);
    w.document.close();
  }

  function beep() {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      const c = new Ctx();
      const o = c.createOscillator(), g = c.createGain();
      o.type = "sine"; o.frequency.value = 880;
      g.gain.value = 0.12; o.connect(g); g.connect(c.destination);
      o.start(); o.stop(c.currentTime + 0.35);
      o.onended = () => c.close();
    } catch {}
  }

  // Live orders: refresh every 10s while watching the orders tab.
  useEffect(() => {
    if (!in_ || tab !== "orders") return;
    const t = setInterval(async () => {
      try {
        const r = await fetch("/api/admin/orders", { headers: headers(token) });
        const d = await r.json();
        if (!d.orders) return;
        setOrders((prev) => {
          const known = new Set(prev.map((o) => o.number));
          const fresh = d.orders.filter((o) => !known.has(o.number));
          if (fresh.length && prev.length) {
            beep();
            setMsg("🔔 New order: " + fresh.map((f) => f.number).join(", "));
          }
          return d.orders;
        });
      } catch {}
    }, 10000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [in_, tab]);

  // Lazy tabs data.
  useEffect(() => {
    if (!in_) return;
    if (tab === "promos") fetch("/api/admin/promos", { headers: headers(token) }).then((r) => r.json()).then((d) => { if (d.promos) setPromos(d.promos); }).catch(() => {});
    if (tab === "reviews") fetch("/api/reviews").then((r) => r.json()).then((d) => { if (d.reviews) setReviews(d.reviews); }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [in_, tab]);

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
    try {
      const [o, p, d] = await Promise.all([
        fetch("/api/admin/orders", { headers: headers(tk) }).then((r) => r.json()),
        fetch("/api/admin/products", { headers: headers(tk) }).then((r) => r.json()),
        fetch("/api/admin/delivery", { headers: headers(tk) }).then((r) => r.json()),
      ]);
      if (o.orders) setOrders(o.orders);
      else setMsg("Orders failed to load: " + (o.error || "unknown error") + " — check you're logged in.");
      if (p.products) setProducts(p.products);
      if (d.areas) setDelivery(d);
    } catch (e) {
      setMsg("Couldn't reach the server. Check your connection and reload.");
    }
  }

  async function setStatus(number, status) {
    await fetch("/api/admin/orders", { method: "PATCH", headers: headers(token), body: JSON.stringify({ number, status }) });
    load();
  }

  async function delOrder(number) {
    if (!window.confirm("Permanently delete order " + number + "? Stock stays deducted.")) return;
    await fetch("/api/admin/orders?number=" + encodeURIComponent(number), { method: "DELETE", headers: headers(token) });
    setMsg("Deleted " + number);
    load();
  }

  const ALL_SIZES = ["28","29","30","31","32","33","34","35","36","37","38","39","40","41","42","43","44","45","46"];
  function sizeOpts(p) {
    const cat = edit[p.id]?.category ?? p.category;
    return cat === "kids" ? ALL_SIZES.slice(0, 8) : ALL_SIZES.slice(8);
  }
  function curSizes(p) { return edit[p.id]?.sizes ?? p.sizes ?? []; }
  function curStock(p) { return edit[p.id]?.stockObj ?? p.stock ?? {}; }
  function toggleSize(p, s) {
    const sizes = curSizes(p);
    const stock = { ...curStock(p) };
    let next;
    if (sizes.includes(s)) { next = sizes.filter((x) => x !== s); delete stock[s]; }
    else { next = [...sizes, s].sort((a, b) => Number(a) - Number(b)); if (stock[s] == null) stock[s] = 5; }
    setEdit((x) => ({ ...x, [p.id]: { ...x[p.id], sizes: next, stockObj: stock } }));
  }
  function setQty(p, s, q) {
    const stock = { ...curStock(p), [s]: Math.max(0, Number(q) || 0) };
    setEdit((x) => ({ ...x, [p.id]: { ...x[p.id], stockObj: stock } }));
  }

  async function saveProduct(id) {
    const p = products.find((x) => x.id === id);
    const patch = {};
    if (edit[id]?.name !== undefined && edit[id].name !== "") patch.name = edit[id].name;
    if (edit[id]?.brand !== undefined && edit[id].brand !== "") patch.brand = edit[id].brand;
    if (edit[id]?.category) patch.category = edit[id].category;
    if (edit[id]?.price !== undefined && edit[id].price !== "") patch.price = Number(edit[id].price);
    if (edit[id]?.sizes) patch.sizes = edit[id].sizes;
    if (edit[id]?.stockObj) patch.stock = edit[id].stockObj;
    if (edit[id]?.oldPrice !== undefined) patch.oldPrice = edit[id].oldPrice === "" ? null : Number(edit[id].oldPrice);
    if (edit[id]?.discount !== undefined && edit[id].discount !== "") {
      const d = Math.min(90, Math.max(0, Number(edit[id].discount) || 0));
      patch.oldPrice = d === 0 ? null : Math.round(p.price / (1 - d / 100));
    }
    await fetch("/api/admin/products", { method: "PATCH", headers: headers(token), body: JSON.stringify({ id, patch }) });
    setMsg("Saved " + id);
    setEdit((e) => ({ ...e, [id]: {} }));
    load();
  }

  async function delProduct(id, name) {
    if (!window.confirm("Delete " + name + "? It disappears from the shop.")) return;
    await fetch("/api/admin/products?id=" + encodeURIComponent(id), { method: "DELETE", headers: headers(token) });
    setMsg("Deleted " + name);
    load();
  }

  async function addProduct(e) {
    e.preventDefault();
    const r = await fetch("/api/admin/products", { method: "POST", headers: headers(token), body: JSON.stringify({ product: { ...np, price: Number(np.price), img: npImg || undefined } }) });
    const d = await r.json();
    if (!r.ok) { setMsg(d.error || "Failed"); return; }
    setNp({ name: "", brand: "Vasky", price: "", category: "men", sizes: "", description: "" });
    setNpImg("");
    setMsg("Product added!");
    load();
  }

  async function savePromos(list) {
    const r = await fetch("/api/admin/promos", { method: "PUT", headers: headers(token), body: JSON.stringify({ promos: list }) });
    const d = await r.json();
    if (!r.ok) { setMsg(d.error || "Failed"); return; }
    setPromos(d.promos);
    setMsg("Promos saved");
  }

  async function delReview(id) {
    await fetch("/api/reviews?id=" + encodeURIComponent(id), { method: "DELETE", headers: headers(token) });
    setReviews((r) => r.filter((x) => x.id !== id));
  }

  function fileToPhoto(file) {
    return new Promise((resolve, reject) => {
      if (!file || !file.type.startsWith("image/")) return reject(new Error("Not an image"));
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const sc = Math.min(1, 1000 / Math.max(img.width, img.height));
        const cv = document.createElement("canvas");
        cv.width = Math.round(img.width * sc); cv.height = Math.round(img.height * sc);
        cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height);
        URL.revokeObjectURL(url);
        resolve(cv.toDataURL("image/jpeg", 0.82));
      };
      img.onerror = () => reject(new Error("Bad image"));
      img.src = url;
    });
  }

  async function uploadImg(id, file) {
    try {
      const img = await fileToPhoto(file);
      if (img.length > 700000) { setMsg("Photo too big after compression."); return; }
      await fetch("/api/admin/products", { method: "PATCH", headers: headers(token), body: JSON.stringify({ id, patch: { img } }) });
      setMsg("Photo saved!");
      load();
    } catch { setMsg("Couldn't read that photo."); }
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
        {[["orders", "Orders"], ["products", "Products"], ["reports", "Reports"], ["delivery", "Delivery"], ["customers", "Customers"], ["promos", "Promos"], ["reviews", "Reviews"], ["password", "Password"]].map(([v, l]) => (
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
            <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
              <input value={oSearch} onChange={(e) => setOSearch(e.target.value)} placeholder="Search number, name, phone…" aria-label="Search orders" style={{ flex: 1, minWidth: 180, border: "1px solid var(--line)", borderRadius: 8, padding: 9 }} />
              <select value={oFilter} onChange={(e) => setOFilter(e.target.value)} aria-label="Filter by status">
                <option value="all">All statuses</option>
                {ORDER_STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
              <button className="btn ghost" onClick={exportCSV}>CSV ↓</button>
            </div>
            <div className="table-wrap"><table className="table">
              <thead><tr><th>Number</th><th>Customer</th><th>Total</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {orders.filter((o) => {
                  if (oFilter !== "all" && o.status !== oFilter) return false;
                  const q = oSearch.trim().toLowerCase();
                  if (!q) return true;
                  return (o.number + " " + o.customer.name + " " + o.customer.phone).toLowerCase().includes(q);
                }).map((o) => (
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
                      <td><button className="btn ghost" onClick={() => setOpen(open === o.number ? null : o.number)}>{open === o.number ? "HIDE" : "VIEW"}</button> <button className="btn ghost" onClick={() => delOrder(o.number)}>✕</button></td>
                    </tr>
                    {open === o.number && (
                      <tr><td colSpan={5}>
                        {o.items.map((i) => <p key={i.id + i.size} style={{ margin: "4px 0" }}>{i.name} · EU {i.size} × {i.qty} — {formatPrice(i.total)}</p>)}
                        <p className="muted">{o.customer.address}, {o.customer.city} ({o.customer.area}) · {o.customer.notes}</p>
                        <p className="muted">Pay: {o.paymentName}{o.whishRef ? " · Whish ref " + o.whishRef : ""} · Sub {formatPrice(o.subtotal)}{o.discount > 0 ? ` − ${formatPrice(o.discount)}${o.promo ? " (" + o.promo + ")" : ""}` : ""} + Del {formatPrice(o.delivery)}</p>
                        <a className="btn ghost" target="_blank" rel="noreferrer" href={waCust(o.customer.phone, `Hi ${o.customer.name}! This is Vasky about order ${o.number} (${o.status}).`)}>WHATSAPP CUSTOMER</a>{" "}
                        <button className="btn ghost" onClick={() => printInvoice(o)}>🖨 INVOICE</button>
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
              <thead><tr><th>Product</th><th>Brand / Cat</th><th>Price</th><th>Discount %</th><th>Sizes (tick)</th><th>Stock (type qty)</th><th></th></tr></thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td><input value={edit[p.id]?.name ?? p.name} onChange={(e) => setEdit((x) => ({ ...x, [p.id]: { ...x[p.id], name: e.target.value } }))} style={{ width: 150 }} /><br /><span className="muted">{p.id}</span></td>
                    <td>
                      <input value={edit[p.id]?.brand ?? p.brand} onChange={(e) => setEdit((x) => ({ ...x, [p.id]: { ...x[p.id], brand: e.target.value } }))} style={{ width: 90 }} />
                      <select value={edit[p.id]?.category ?? p.category} onChange={(e) => setEdit((x) => ({ ...x, [p.id]: { ...x[p.id], category: e.target.value } }))}>
                        <option value="men">men</option><option value="women">women</option><option value="kids">kids</option>
                      </select>
                    </td>
                    <td><input value={edit[p.id]?.price ?? p.price} onChange={(e) => setEdit((x) => ({ ...x, [p.id]: { ...x[p.id], price: e.target.value } }))} style={{ width: 70 }} /></td>
                    <td><input placeholder={p.oldPrice ? String(Math.round((1 - p.price / p.oldPrice) * 100)) : "0"} value={edit[p.id]?.discount ?? ""} onChange={(e) => setEdit((x) => ({ ...x, [p.id]: { ...x[p.id], discount: e.target.value } }))} style={{ width: 60 }} /></td>
                    <td>
                      <div className="sizecheck">
                        {sizeOpts(p).map((s) => (
                          <label key={s} className={curSizes(p).includes(s) ? "on" : ""}>
                            <input type="checkbox" checked={curSizes(p).includes(s)} onChange={() => toggleSize(p, s)} />{s}
                          </label>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div className="stockgrid">
                        {curSizes(p).map((s) => (
                          <label key={s}>EU{s}<input type="number" min="0" value={curStock(p)[s] ?? 0} onChange={(e) => setQty(p, s, e.target.value)} /></label>
                        ))}
                      </div>
                    </td>
                    <td style={{ whiteSpace: "nowrap" }}><button className="btn" onClick={() => saveProduct(p.id)}>SAVE</button> <button className="btn ghost" onClick={() => delProduct(p.id, p.name)}>✕</button><br />
                      <label className="btn ghost" style={{ marginTop: 4, display: "inline-block" }}>{p.img && !p.img.startsWith("https://images.unsplash.com") ? "📷✓" : "📷"}<input type="file" accept="image/*" hidden onChange={(e) => { if (e.target.files[0]) uploadImg(p.id, e.target.files[0]); e.target.value = ""; }} /></label>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table></div>
            <h3 style={{ color: "var(--brand)", marginTop: 22 }}>Add product</h3>
            <form onSubmit={addProduct} className="inputs" style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr" }}>
              <input placeholder="Name *" value={np.name} onChange={(e) => setNp({ ...np, name: e.target.value })} required />
              <input placeholder="Brand" value={np.brand} onChange={(e) => setNp({ ...np, brand: e.target.value })} />
              <input type="number" placeholder="Price *" value={np.price} onChange={(e) => setNp({ ...np, price: e.target.value })} required />
              <select value={np.category} onChange={(e) => setNp({ ...np, category: e.target.value })}>
                <option value="men">men</option><option value="women">women</option><option value="kids">kids</option>
              </select>
              <input placeholder="Sizes: 40, 41, 42" value={np.sizes} onChange={(e) => setNp({ ...np, sizes: e.target.value })} style={{ gridColumn: "1 / -1" }} />
              <input placeholder="Description" value={np.description} onChange={(e) => setNp({ ...np, description: e.target.value })} style={{ gridColumn: "1 / -1" }} />
              <label className="btn ghost" style={{ gridColumn: "1 / -1", textAlign: "center" }}>{npImg ? "📷 Photo ready ✓ (tap to change)" : "📷 Add photo"}<input type="file" accept="image/*" hidden onChange={async (e) => { if (e.target.files[0]) { try { setNpImg(await fileToPhoto(e.target.files[0])); } catch { setMsg("Couldn't read that photo."); } } e.target.value = ""; }} /></label>
              <button className="btn" style={{ gridColumn: "1 / -1" }}>ADD PRODUCT</button>
            </form>
          </>
        )}
        {tab === "reports" && (
          <>
            <h2 style={{ color: "var(--brand)" }}>Sales reports</h2>
            {(() => {
              const days = [];
              for (let i = 13; i >= 0; i--) {
                const d = new Date(); d.setDate(d.getDate() - i);
                const key = d.toISOString().slice(0, 10);
                days.push({ key, label: d.toLocaleDateString(undefined, { day: "numeric", month: "numeric" }), total: 0, n: 0 });
              }
              const byDay = Object.fromEntries(days.map((d) => [d.key, d]));
              live.forEach((o) => { const k = String(o.createdAt || "").slice(0, 10); if (byDay[k]) { byDay[k].total += o.total; byDay[k].n++; } });
              const max = Math.max(1, ...days.map((d) => d.total));
              const items = {};
              live.forEach((o) => o.items.forEach((i) => { items[i.name] = items[i.name] || { qty: 0, rev: 0 }; items[i.name].qty += i.qty; items[i.name].rev += i.total; }));
              const top = Object.entries(items).sort((a, b) => b[1].qty - a[1].qty).slice(0, 8);
              const avg = live.length ? revenue / live.length : 0;
              return (<>
                <div className="stat-cards">
                  <div className="stat"><b>{formatPrice(revenue)}</b><span>Revenue (14d window above)</span></div>
                  <div className="stat"><b>{live.length}</b><span>Paid-track orders</span></div>
                  <div className="stat"><b>{formatPrice(avg)}</b><span>Average order</span></div>
                  <div className="stat"><b>{pending}</b><span>Awaiting action</span></div>
                </div>
                <h3 style={{ color: "var(--brand)" }}>Revenue — last 14 days</h3>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 150, border: "1px solid var(--line)", borderRadius: 12, padding: 12, background: "#fff" }}>
                  {days.map((d) => (
                    <div key={d.key} title={`${d.label}: $${d.total.toFixed(2)} (${d.n})`} style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "center", height: "100%" }}>
                      <div style={{ width: "100%", maxWidth: 34, height: Math.max(3, (d.total / max) * 100) + "%", background: "var(--brand)", borderRadius: "4px 4px 0 0" }} />
                      <small className="muted" style={{ fontSize: 9 }}>{d.label}</small>
                    </div>
                  ))}
                </div>
                <h3 style={{ color: "var(--brand)", marginTop: 18 }}>Best sellers</h3>
                {top.length === 0 && <p className="muted">No sales yet.</p>}
                <div className="table-wrap"><table className="table">
                  <thead><tr><th>Product</th><th>Pairs</th><th>Revenue</th></tr></thead>
                  <tbody>{top.map(([n, v]) => <tr key={n}><td>{n}</td><td>{v.qty}</td><td><b>{formatPrice(v.rev)}</b></td></tr>)}</tbody>
                </table></div>
              </>);
            })()}
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
        {tab === "promos" && (
          <>
            <h2 style={{ color: "var(--brand)" }}>Promo codes</h2>
            <p className="muted">Customers enter these at checkout. Changes apply instantly.</p>
            <div className="table-wrap"><table className="table">
              <thead><tr><th>Code</th><th>Type</th><th>Value</th><th></th></tr></thead>
              <tbody>
                {promos.map((p, i) => (
                  <tr key={p.code}>
                    <td><b>{p.code}</b></td>
                    <td>{p.type === "freeship" ? "Free delivery" : p.value + "% off"}</td>
                    <td>{p.type === "percent" ? p.value + "%" : "—"}</td>
                    <td><button className="btn ghost" onClick={() => { const l = promos.filter((_, j) => j !== i); setPromos(l); savePromos(l); }}>✕</button></td>
                  </tr>
                ))}
              </tbody>
            </table></div>
            <div className="inputs" style={{ gridTemplateColumns: "1fr 1fr 1fr auto", marginTop: 12 }}>
              <input placeholder="CODE" value={newPromo.code} onChange={(e) => setNewPromo({ ...newPromo, code: e.target.value.toUpperCase() })} style={{ textTransform: "uppercase" }} />
              <select value={newPromo.type} onChange={(e) => setNewPromo({ ...newPromo, type: e.target.value })}>
                <option value="percent">% off</option><option value="freeship">Free delivery</option>
              </select>
              <input type="number" placeholder="10" value={newPromo.value} onChange={(e) => setNewPromo({ ...newPromo, value: Number(e.target.value) })} />
              <button className="btn" onClick={() => { if (!newPromo.code.trim()) return; const l = [...promos, { code: newPromo.code.trim().toUpperCase(), type: newPromo.type, value: newPromo.value, minSubtotal: 0, note: "" }]; setPromos(l); savePromos(l); setNewPromo({ code: "", type: "percent", value: 10 }); }}>ADD</button>
            </div>
          </>
        )}
        {tab === "reviews" && (
          <>
            <h2 style={{ color: "var(--brand)" }}>Reviews ({reviews.length})</h2>
            {reviews.length === 0 && <p className="muted">No reviews yet.</p>}
            {reviews.map((r) => (
              <div key={r.id || (r.productId + r.createdAt)} className="line">
                <div style={{ flex: 1 }}>
                  <b>{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)} {r.name}</b>
                  <p className="muted" style={{ margin: "4px 0" }}>{r.text}</p>
                  <span className="muted">{r.productId} · {new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
                <button className="btn ghost" onClick={() => delReview(r.id)}>✕</button>
              </div>
            ))}
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
