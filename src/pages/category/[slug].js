import Link from "next/link";
import { useRouter } from "next/router";
import ProductCard from "../../components/ProductCard";
import { useCatalog } from "../../lib/catalog";

const TITLES = { men: "Men", women: "Women", kids: "Kids" };

export default function Category({ slug, initialProducts }) {
  const router = useRouter();
  const qslug = typeof router.query.slug === "string" ? router.query.slug : slug;
  const products = useCatalog(initialProducts);
  const items = products.filter((p) => p.category === qslug);
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

export async function getServerSideProps({ params }) {
  const { catalog } = await import("../../lib/server-products");
  return { props: { slug: params.slug, initialProducts: await catalog() } };
}
