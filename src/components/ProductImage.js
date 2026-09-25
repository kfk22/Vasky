// Photo with instant SVG fallback — a broken image is never shown.
import { useState } from "react";
import ShoeArt from "./ShoeArt";

export default function ProductImage({ product, crop, eager }) {
  const [failed, setFailed] = useState(false);
  if (failed || !product.img) return <ShoeArt art={product.art} name={product.name} />;
  const src = crop && /^https?:/.test(product.img) ? product.img + "&crop=" + crop : product.img;
  return (
    <img
      src={src}
      alt={product.name}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      onError={() => setFailed(true)}
      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
    />
  );
}
