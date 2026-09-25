import Link from "next/link";
import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import ProductImage from "../components/ProductImage";
import Reveal from "../components/Reveal";
import { formatPrice } from "../lib/format";
import { useCatalog, findIn } from "../lib/catalog";

function useCountdown() {
  const [left, setLeft] = useState("");
  useEffect(() => {
    function tick() {
      const now = new Date();
      const end = new Date(now);
      end.setDate(now.getDate() + ((7 - now.getDay()) % 7 || 7));
      end.setHours(23, 59, 59, 0);
      const ms = Math.max(0, end - now);
      const d = Math.floor(ms / 864e5), h = Math.floor(ms / 36e5) % 24, m = Math.floor(ms / 6e4) % 60;
      setLeft(`${d}d ${h}h ${m}m`);
    }
    tick();
    const t = setInterval(tick, 30000);
    return () => clearInterval(t);
  }, []);
  return left;
}

const CATS = [
  { slug: "men", name: "Men", desc: "Everyday style, made better" },
  { slug: "women", name: "Women", desc: "Discover the latest styles" },
  { slug: "kids", name: "Kids", desc: "Comfort for every step" },
];

export default function Home({ initialProducts }) {
  const products = useCatalog(initialProducts);
  const arrivals = products.filter((p) => (p.tags || []).includes("new")).slice(0, 4);
  const popular = products.filter((p) => (p.tags || []).includes("popular")).slice(0, 4);
  const best = [...products].sort((a, b) => (b.reviews || 0) - (a.reviews || 0)).slice(0, 4);
  const sale = products.filter((p) => p.oldPrice).slice(0, 4);
  const [email, setEmail] = useState("");
  const [news, setNews] = useState("");
  const countdown = useCountdown();
  const [recent, setRecent] = useState([]);
  useEffect(() => {
    try {
      const slugs = JSON.parse(localStorage.getItem("vasky-recent") || "[]");
      setRecent(slugs.map((s) => findIn(products, s)).filter(Boolean).slice(0, 4));
    } catch {}
  }, [products]);

  function subscribe(e) {
    e.preventDefault();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { setNews("Please enter a valid email."); return; }
    try {
      const list = JSON.parse(localStorage.getItem("vasky-news") || "[]");
      list.push(email);
      localStorage.setItem("vasky-news", JSON.stringify(list));
    } catch {}
    setNews("Welcome aboard! Check your inbox for 10% off.");
    setEmail("");
  }

  return (
    <>
      <section className="hero">
        <div className="wrap">
          <div>
            <p className="kicker">VASKY SHOES · LEBANON</p>
            <h1>STEP INTO<br />YOUR STYLE.</h1>
            <p className="sub">Sneakers, classics and kids&apos; favorites — picked for comfort, built for every day.</p>
            <div className="cta-row">
              <Link href="/shop" className="btn">SHOP NOW →</Link>
              <Link href="/shop?tag=new" className="btn ghost">NEW ARRIVALS</Link>
            </div>
            <div className="hero-badges">
              <div><b>24+</b><span>Styles</span></div>
              <div><b>COD</b><span>Cash on delivery</span></div>
              <div><b>1990</b><span>Since</span></div>
            </div>
          </div>
          <div className="hero-art">
            <Link href={"/product/" + arrivals[0].slug} className="hero-photo float-slow">
              <ProductImage product={arrivals[0]} eager />
              <span className="hero-tag">{arrivals[0].name} · {formatPrice(arrivals[0].price)}</span>
            </Link>
            {arrivals[1] && (
              <Link href={"/product/" + arrivals[1].slug} className="hero-mini float-slow2">
                <ProductImage product={arrivals[1]} eager />
              </Link>
            )}
          </div>
        </div>
      </section>

      <div className="marquee" aria-hidden="true">
        <div className="marquee-in">
          {Array(2).fill("FREE DELIVERY OVER $75 ✦ CASH ON DELIVERY ✦ NEW DROPS WEEKLY ✦ EASY EXCHANGES ✦ ").map((t, i) => <span key={i}>{t}</span>)}
        </div>
      </div>

      <section className="section">
        <div className="wrap">
          <div className="sec-head">
            <div><p className="kicker">Just in</p><h2>New arrivals</h2></div>
            <Link href="/shop?tag=new">VIEW ALL →</Link>
          </div>
          <div className="grid">{arrivals.slice(0, 4).map((p) => <ProductCard key={p.id} product={p} />)}</div>
        </div>
      </section>

      <section className="section alt">
        <div className="wrap">
          <div className="sec-head">
            <div><p className="kicker">Loved</p><h2>Popular right now</h2></div>
            <Link href="/shop?sort=popular">VIEW ALL →</Link>
          </div>
          <div className="grid">{popular.slice(0, 4).map((p) => <ProductCard key={p.id} product={p} />)}</div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="sec-head">
            <div><p className="kicker">Categories</p><h2>Shop by category</h2></div>
            <Link href="/shop">VIEW ALL →</Link>
          </div>
          <div className="grid cat">
            {CATS.map((c, i) => (
              <Reveal key={c.slug} delay={i * 80}>
                <Link href={"/category/" + c.slug} className="tile">
                  <h3>{c.name}</h3><p>{c.desc}</p><span className="go">EXPLORE →</span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="wrap">
          <div className="sec-head">
            <div><p className="kicker">Top rated</p><h2>Best sellers</h2></div>
            <Link href="/shop?tag=sale">SALE →</Link>
          </div>
          <div className="grid">{best.slice(0, 4).map((p) => <ProductCard key={p.id} product={p} />)}</div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="sec-head">
            <div><p className="kicker">Ending soon · {countdown}</p><h2>Sale picks</h2></div>
            <Link href="/shop?tag=sale">ALL SALE →</Link>
          </div>
          <div className="grid">{sale.slice(0, 4).map((p) => <ProductCard key={p.id} product={p} />)}</div>
        </div>
      </section>

      {recent.length > 0 && (
        <section className="section alt">
          <div className="wrap">
            <div className="sec-head">
              <div><p className="kicker">Pick up where you left off</p><h2>Recently viewed</h2></div>
            </div>
            <div className="grid">{recent.map((p) => <ProductCard key={p.id} product={p} />)}</div>
          </div>
        </section>
      )}

      <section className="band">
        <p className="kicker" style={{ justifyContent: "center" }}>WHY VASKY</p>
        <h2>Comfort first. Style always.</h2>
        <p>Real sizes, honest prices, cash on delivery and easy exchanges across Lebanon.</p>
        <div className="wrap perks" style={{ marginTop: 30, textAlign: "left" }}>
          {[["Free delivery $75+", "No fees when your cart passes $75."], ["Cash on Delivery", "Pay at your door, no cards needed."], ["Easy exchanges", "Wrong size? Swap it in days."], ["Local support", "Real humans, fast replies."]].map(([b, p]) => (
            <div key={b} className="perk"><b>{b}</b><p>{p}</p></div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="sec-head"><div><p className="kicker">Reviews</p><h2>Customers say</h2></div></div>
          <div className="reviews">
            {[["Rana K., Beirut", "Ordered Tuesday, arrived Thursday. The size guide was spot on.", 5], ["Jad M., Jounieh", "Paid cash at the door. Shoes look even better in person.", 5], ["Sara H., Saida", "Exchanged a size with one message. Super easy.", 4]].map(([n, t, s]) => (
              <div key={n} className="review">
                <div className="stars">{"★".repeat(s)}{"☆".repeat(5 - s)}</div>
                <p>“{t}”</p><b>{n}</b>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="wrap">
          <div className="news">
            <div>
              <p className="kicker">Stay connected</p>
              <h2>Be the first to know.</h2>
              <p className="muted">New drops, offers and 10% off your first order.</p>
            </div>
            <form onSubmit={subscribe}>
              <input type="email" placeholder="Your email address" value={email} onChange={(e) => setEmail(e.target.value)} aria-label="Email" />
              <button className="btn" type="submit">SUBSCRIBE</button>
              {news && <p className="muted" style={{ gridColumn: "1/-1" }}>{news}</p>}
            </form>
          </div>
        </div>
      </section>
    </>
  );
}

export async function getServerSideProps() {
  const { catalog } = await import("../lib/server-products");
  return { props: { initialProducts: await catalog() } };
}
