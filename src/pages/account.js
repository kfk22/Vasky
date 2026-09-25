import Link from "next/link";
import { useState } from "react";
import { useStore } from "../lib/store";
import { useCatalog, findIn } from "../lib/catalog";
import { formatPrice } from "../lib/format";

export default function Account() {
  const { user, setUser, favorites, myOrders, showToast } = useStore();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [track, setTrack] = useState("");
  const [found, setFound] = useState(null);
  const [trackErr, setTrackErr] = useState("");

  function save(e) {
    e.preventDefault();
    if (name.trim().length < 2) return showToast("Enter your name");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return showToast("Enter a valid email");
    setUser({ name: name.trim(), email: email.trim() });
    showToast("Account saved");
  }

  async function lookup(e) {
    e.preventDefault();
    setTrackErr(""); setFound(null);
    try {
      const r = await fetch("/api/orders?number=" + encodeURIComponent(track.trim()));
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Not found");
      setFound(d.order);
    } catch (err) { setTrackErr(err.message); }
  }

  const catalog = useCatalog();
  const saved = favorites.map((id) => findIn(catalog, id)).filter(Boolean);

  return (
    <div className="wrap" style={{ padding: "34px 20px 60px", maxWidth: 900 }}>
      <p className="kicker">ACCOUNT</p>
      <h1 className="title">Your account</h1>
      <div className="split" style={{ gridTemplateColumns: "1fr 1fr", marginTop: 18 }}>
        <form className="form" style={{ gridTemplateColumns: "1fr" }} onSubmit={save}>
          <h3 style={{ color: "var(--brand)", margin: 0 }}>Profile</h3>
          <label>Name<input value={name} onChange={(e) => setName(e.target.value)} /></label>
          <label>Email<input value={email} onChange={(e) => setEmail(e.target.value)} /></label>
          <button className="btn">SAVE</button>
          <h3 style={{ color: "var(--brand)", margin: "10px 0 0" }}>Saved ({saved.length})</h3>
          {saved.length === 0 ? <p className="muted">No favorites yet.</p> : saved.slice(0, 5).map((p) => (
            <p key={p.id} style={{ margin: "4px 0" }}><Link href={"/product/" + p.slug}><b style={{ color: "var(--brand)" }}>{p.name}</b></Link> <span className="muted">{formatPrice(p.price)}</span></p>
          ))}
          {saved.length > 0 && <Link href="/favorites" className="muted"><u>View all →</u></Link>}
        </form>
        <div>
          <form className="form" style={{ gridTemplateColumns: "1fr" }} onSubmit={lookup}>
            <h3 style={{ color: "var(--brand)", margin: 0 }}>Track an order</h3>
            <label>Order number<input value={track} onChange={(e) => setTrack(e.target.value)} placeholder="VS-…" /></label>
            <button className="btn">TRACK</button>
            {trackErr && <p className="err">{trackErr}</p>}
            {found && <p><b>{found.number}</b> · <span className="pill">{found.status}</span> · {formatPrice(found.total)}</p>}
          </form>
          <div className="form" style={{ gridTemplateColumns: "1fr", marginTop: 14 }}>
            <h3 style={{ color: "var(--brand)", margin: 0 }}>Recent orders (this device)</h3>
            {myOrders.length === 0 ? <p className="muted">No orders yet.</p> : myOrders.map((o) => (
              <p key={o} style={{ margin: "4px 0" }}><Link href={"/order/" + o}><b style={{ color: "var(--brand)" }}>{o}</b></Link></p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
