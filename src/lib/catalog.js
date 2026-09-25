import { useEffect, useState } from "react";
import { products as base } from "../data/products";

let cache = null;
let inflight = null;

function fetchLive() {
  if (!inflight) {
    inflight = fetch("/api/products")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (Array.isArray(d) && d.length) cache = d;
        return cache;
      })
      .catch(() => cache)
      .finally(() => { inflight = null; });
  }
  return inflight;
}

// Live catalog: starts as initial (SSR or bundled base for instant paint),
// then swaps to the server catalog (admin edits: deletes, photos, prices, stock, new items).
export function useCatalog(initial) {
  const [products, setProducts] = useState(cache || initial || base);
  useEffect(() => {
    let on = true;
    if (cache) { setProducts(cache); return; }
    fetchLive().then((c) => { if (on && c) setProducts(c); });
    return () => { on = false; };
  }, []);
  return products;
}

// True once the server catalog has arrived (base may be stale before that).
export function useLiveFlag() {
  const [live, setLive] = useState(!!cache);
  useEffect(() => {
    if (cache) { setLive(true); return; }
    fetchLive().then(() => setLive(true));
  }, []);
  return live;
}

export function findIn(list, idOrSlug) {
  return (list || []).find((p) => p.id === idOrSlug || p.slug === idOrSlug) || null;
}
