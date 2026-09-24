import Link from "next/link";
import ProductCard from "../../components/ProductCard";
import { products } from "../../data/products";

const TITLES = { men: "Men", women: "Women", kids: "Kids" };

export default function Category({ slug, items }) {
  return (
    <div className="wrap" style={{ padding: "34px 20px 60px" }}>
      <p className="kicker">{TITLES[slug] || slug} · VASKY</p>
      <h1 className="title">{TITLES[slug] || slug}, made for every step.</h1>
      <p className="muted">{items.length} styles</p>
      {items.length === 0 ? (
        <div className="empty"><p>Nothing here yet.</p><Link href="/shop" className="btn">SHOP ALL</Link></div>
      ) : (
        <div className="grid" style={{ marginTop: 22 }}>{items.map((p) => <ProductCard key={p.id} product={p} />)}</div>
      )}
    </div>
  );
}

export async function getStaticPaths() {
  return { paths: [{ params: { slug: "men" } }, { params: { slug: "women" } }, { params: { slug: "kids" } }], fallback: false };
}

export async function getStaticProps({ params }) {
  return { props: { slug: params.slug, items: products.filter((p) => p.category === params.slug) } };
}
