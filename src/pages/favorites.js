import { useState } from "react";
import Link from "next/link";
import ProductCard from "../components/ProductCard";
import { useStore } from "../lib/store";
import { getProduct } from "../data/products";

export default function Favorites() {
  const { favorites } = useStore();
  const items = favorites.map(getProduct).filter(Boolean);
  if (!items.length) {
    return (
      <div className="wrap" style={{ padding: "60px 20px", textAlign: "center" }}>
        <h1 className="title">No favorites yet.</h1>
        <p className="muted">Tap the heart on any shoe to save it here.</p>
        <Link href="/shop" className="btn" style={{ display: "inline-block", marginTop: 16 }}>DISCOVER SHOES</Link>
      </div>
    );
  }
  return (
    <div className="wrap" style={{ padding: "34px 20px 60px" }}>
      <h1 className="title">Favorites ({items.length})</h1>
      <div className="grid" style={{ marginTop: 20 }}>{items.map((p) => <ProductCard key={p.id} product={p} />)}</div>
    </div>
  );
}
