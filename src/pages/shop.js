import { useMemo, useState } from "react";
import { useRouter } from "next/router";
import ProductCard from "../components/ProductCard";
import { products, brands, allSizes, allColors } from "../data/products";

function useQueryState(router) {
  const q = router.query;
  return {
    tag: typeof q.tag === "string" ? q.tag : "",
    cat: typeof q.cat === "string" ? q.cat : "all",
    sort: typeof q.sort === "string" ? q.sort : "featured",
    search: typeof q.q === "string" ? q.q : "",
  };
}

export function filterSort(list, f) {
  let out = list.filter((p) => {
    if (f.cat !== "all" && p.category !== f.cat) return false;
    if (f.tag && !(p.tags || []).includes(f.tag)) return false;
    if (f.brand !== "all" && p.brand !== f.brand) return false;
    if (f.color !== "all" && !(p.colors || []).some((c) => c.name === f.color)) return false;
    if (f.size !== "all" && !(p.sizes || []).includes(f.size)) return false;
    if (f.avail === "in" && !Object.values(p.stock || {}).some((n) => n > 0)) return false;
    if (f.avail === "sale" && !p.oldPrice) return false;
    if (p.price < f.min || p.price > f.max) return false;
    if (f.search) {
      const hay = (p.name + " " + p.brand + " " + p.category + " " + (p.keywords || "") + " " + (p.description || "")).toLowerCase();
      const terms = f.search.toLowerCase().split(/\s+/).filter(Boolean);
      if (!terms.every((t) => hay.includes(t))) return false;
    }
    return true;
  });
  const by = {
    "price-asc": (a, b) => a.price - b.price,
    "price-desc": (a, b) => b.price - a.price,
    newest: (a, b) => Number((b.tags || []).includes("new")) - Number((a.tags || []).includes("new")),
    popular: (a, b) => (b.reviews || 0) - (a.reviews || 0),
  }[f.sort];
  if (by) out = [...out].sort(by);
  return out;
}

export default function Shop() {
  const router = useRouter();
  const init = useQueryState(router);
  const [brand, setBrand] = useState("all");
  const [color, setColor] = useState("all");
  const [size, setSize] = useState("all");
  const [avail, setAvail] = useState("all");
  const [min, setMin] = useState(0);
  const [max, setMax] = useState(150);
  const [sort, setSort] = useState(init.sort);
  const [search, setSearch] = useState(init.search);

  const f = {
    cat: init.cat, tag: init.tag, brand, color, size, avail, min: Number(min) || 0, max: Number(max) || 9999, sort, search,
  };
  const visible = useMemo(() => filterSort(products, f), [init.cat, init.tag, brand, color, size, avail, min, max, sort, search]);

  function reset() { setBrand("all"); setColor("all"); setSize("all"); setAvail("all"); setMin(0); setMax(150); setSort("featured"); setSearch(""); }

  return (
    <div className="wrap shop">
      <aside className="filters">
        <h3>Search</h3>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Name, brand…" aria-label="Search products" style={{ width: "100%", border: "1px solid var(--line)", borderRadius: 8, padding: 9 }} />
        <h3>Category</h3>
        {[["all", "All"], ["men", "Men"], ["women", "Women"], ["kids", "Kids"]].map(([v, l]) => (
          <label key={v}><input type="radio" name="cat" checked={f.cat === v} onChange={() => router.push(v === "all" ? "/shop" : "/shop?cat=" + v, undefined, { shallow: true })} />{l}</label>
        ))}
        <h3>Brand</h3>
        <label><input type="radio" name="brand" checked={brand === "all"} onChange={() => setBrand("all")} />All</label>
        {brands.map((b) => <label key={b}><input type="radio" name="brand" checked={brand === b} onChange={() => setBrand(b)} />{b}</label>)}
        <h3>Size (EU)</h3>
        <select value={size} onChange={(e) => setSize(e.target.value)} style={{ width: "100%" }}>
          <option value="all">All sizes</option>
          {allSizes.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <h3>Color</h3>
        <select value={color} onChange={(e) => setColor(e.target.value)} style={{ width: "100%" }}>
          <option value="all">All colors</option>
          {allColors.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
        </select>
        <h3>Price</h3>
        <div style={{ display: "flex", gap: 6 }}>
          <input type="number" value={min} min={0} onChange={(e) => setMin(e.target.value)} aria-label="Min price" style={{ width: "100%" }} />
          <input type="number" value={max} min={0} onChange={(e) => setMax(e.target.value)} aria-label="Max price" style={{ width: "100%" }} />
        </div>
        <h3>Availability</h3>
        {[["all", "All"], ["in", "In stock"], ["sale", "On sale"]].map(([v, l]) => (
          <label key={v}><input type="radio" name="avail" checked={avail === v} onChange={() => setAvail(v)} />{l}</label>
        ))}
        <button className="btn ghost" style={{ width: "100%", marginTop: 14 }} onClick={reset}>RESET</button>
      </aside>
      <section>
        <div className="toolbar">
          <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort">
            <option value="featured">Featured</option>
            <option value="newest">Newest</option>
            <option value="price-asc">Price low → high</option>
            <option value="price-desc">Price high → low</option>
            <option value="popular">Popular</option>
          </select>
          <span className="count">{visible.length} styles</span>
        </div>
        {visible.length === 0 ? (
          <div className="empty">
            <h3>No shoes match those filters.</h3>
            <p>Try clearing a filter or searching something else.</p>
            <button className="btn" onClick={reset}>CLEAR FILTERS</button>
          </div>
        ) : (
          <div className="grid" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>{visible.map((p) => <ProductCard key={p.id} product={p} />)}</div>
        )}
      </section>
    </div>
  );
}
