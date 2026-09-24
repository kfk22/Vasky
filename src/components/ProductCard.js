import Link from "next/link";
import { useState } from "react";
import { useStore } from "../lib/store";
import { formatPrice } from "../lib/format";
import { discountPct } from "../data/products";
import ProductImage from "./ProductImage";
import Reveal from "./Reveal";

export default function ProductCard({ product, index = 0 }) {
  const { addToCart, toggleFavorite, isFav } = useStore();
  const [size, setSize] = useState(product.sizes.includes("42") ? "42" : product.sizes[0]);
  const fav = isFav(product.id);
  const pct = discountPct(product);
  const stock = product.stock?.[size] ?? 0;

  return (
    <Reveal delay={Math.min(index, 7) * 60}>
      <article className="card">
        <Link href={"/product/" + product.slug} className="thumb zoom">
          {pct > 0 && <span className="badge sale">-{pct}%</span>}
          {product.tags?.includes("new") && <span className="badge new">NEW</span>}
          <ProductImage product={product} />
          <span className="quick">VIEW →</span>
        </Link>
        <button className={"fav" + (fav ? " on" : "")} aria-label="Favorite" onClick={() => toggleFavorite(product.id)}>♥</button>
        <div className="meta">
          <p className="brand">{product.brand} · {product.category}</p>
          <Link href={"/product/" + product.slug} className="name">{product.name}</Link>
          <p className="price">
            {formatPrice(product.price)}{" "}
            {product.oldPrice && <s>{formatPrice(product.oldPrice)}</s>}
          </p>
          <div className="row">
            <select value={size} onChange={(e) => setSize(e.target.value)} aria-label="Size">
              {product.sizes.map((s) => (
                <option key={s} value={s} disabled={(product.stock?.[s] ?? 0) <= 0}>
                  EU {s}{(product.stock?.[s] ?? 0) <= 0 ? " — out" : ""}
                </option>
              ))}
            </select>
            <button
              className="btn"
              disabled={stock <= 0}
              onClick={() => addToCart(product.id, size, 1, stock, { color: product.colors?.[0]?.name })}
            >
              {stock <= 0 ? "OUT" : "ADD"}
            </button>
          </div>
        </div>
      </article>
    </Reveal>
  );
}
