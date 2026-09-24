import { useMemo, useState } from "react";
import Link from "next/link";
import ProductCard from "../components/ProductCard";
import { products } from "../data/products";

export default function SearchPage() {
  const [q, setQ] = useState("");
  const results = useMemo(() => {
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length) return [];
    return products.filter((p) => {
      const hay = (p.name + " " + p.brand + " " + p.category + " " + (p.keywords || "")).toLowerCase();
      return terms.every((t) => hay.includes(t));
    }).slice(0, 12);
  }, [q]);

  const sugg = useMemo(() => {
    if (q.trim().length < 2) return [];
    const low = q.toLowerCase();
    return products.filter((p) => p.name.toLowerCase().includes(low)).slice(0, 5);
  }, [q]);

  return (
    <div className="wrap" style={{ padding: "34px 20px 60px" }}>
      <p className="kicker">SEARCH</p>
      <h1 className="title">Find your pair.</h1>
      <form onSubmit={(e) => e.preventDefault()} style={{ display: "flex", gap: 8, marginTop: 18, maxWidth: 560 }}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Try ‘runner’, ‘leather’, ‘kids’…" aria-label="Search" style={{ flex: 1, border: "1px solid var(--line)", borderRadius: 10, padding: 13 }} />
        {q && <button type="button" className="btn ghost" onClick={() => setQ("")}>CLEAR</button>}
      </form>
      {sugg.length > 0 && (
        <div style={{ border: "1px solid var(--line)", borderRadius: 10, marginTop: 10, maxWidth: 560, background: "#fff" }}>
          {sugg.map((p) => <Link key={p.id} href={"/product/" + p.slug} style={{ display: "block", padding: "10px 14px", fontSize: 14 }}><b style={{ color: "var(--brand)" }}>{p.name}</b> <span className="muted">· {p.brand}</span></Link>)}
        </div>
      )}
      <div style={{ marginTop: 26 }}>
        {q.trim() === "" ? (
          <p className="muted">Popular right now: <Link href="/search" onClick={(e) => { e.preventDefault(); setQ("runner"); }}><u>runner</u></Link> · <Link href="/product/classic-city-sneaker"><u>city</u></Link> · <Link href="/category/kids"><u>kids</u></Link></p>
        ) : results.length === 0 ? (
          <div className="empty"><h3>No results for “{q}”.</h3><p>Check spelling or try “sneaker”, “boot”, “kids”.</p><Link href="/shop" className="btn">BROWSE ALL</Link></div>
        ) : (
          <div className="grid">{results.map((p) => <ProductCard key={p.id} product={p} />)}</div>
        )}
      </div>
    </div>
  );
}
