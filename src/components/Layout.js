import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useStore } from "../lib/store";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/category/men", label: "Men" },
  { href: "/category/women", label: "Women" },
  { href: "/category/kids", label: "Kids" },
  { href: "/shop?tag=new", label: "New Arrivals" },
  { href: "/shop?tag=sale", label: "Sale" },
];

export function Navbar() {
  const { cartCount } = useStore();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  useEffect(() => setMounted(true), []);

  function submit(e) {
    e.preventDefault();
    router.push("/search?q=" + encodeURIComponent(q.trim()));
    setOpen(false);
  }

  return (
    <header className="nav">
      <div className="announce">FREE DELIVERY ON ORDERS OVER $75 · CASH ON DELIVERY</div>
      <div className="nav-main">
        <button className="burger" aria-label="Menu" onClick={() => setOpen(!open)}>
          <span /><span /><span />
        </button>
        <Link href="/" className="logo">VASKY</Link>
        <nav className="links">
          {LINKS.map((l) => (
            <Link key={l.href + l.label} href={l.href} className={mounted && router.asPath === l.href ? "active" : ""}>{l.label}</Link>
          ))}
        </nav>
        <div className="actions">
          <form className="search" onSubmit={submit} role="search">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search shoes…" aria-label="Search" />
            {q && <button type="button" className="clear" onClick={() => setQ("")} aria-label="Clear search">×</button>}
            <button type="submit" aria-label="Search">⌕</button>
          </form>
          <Link href="/favorites" aria-label="Favorites" className="icon">♥</Link>
          <Link href="/account" aria-label="Account" className="icon">◉</Link>
          <Link href="/cart" aria-label="Cart" className="icon cart">🛒{cartCount > 0 && <b>{cartCount}</b>}</Link>
        </div>
      </div>
      {open && (
        <nav className="mobile">
          {LINKS.map((l) => (
            <Link key={l.href + l.label} href={l.href} onClick={() => setOpen(false)}>{l.label}</Link>
          ))}
          <Link href="/favorites" onClick={() => setOpen(false)}>Favorites</Link>
          <Link href="/account" onClick={() => setOpen(false)}>Account</Link>
          <Link href="/admin" onClick={() => setOpen(false)}>Admin</Link>
        </nav>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap cols">
        <div>
          <p className="logo sm">VASKY</p>
          <p>Shoes for every step. Proudly local since 1990.</p>
        </div>
        <div>
          <h4>Shop</h4>
          <Link href="/category/men">Men</Link>
          <Link href="/category/women">Women</Link>
          <Link href="/category/kids">Kids</Link>
          <Link href="/shop?tag=sale">Sale</Link>
        </div>
        <div>
          <h4>Vasky</h4>
          <Link href="/shop">All shoes</Link>
          <Link href="/favorites">Favorites</Link>
          <Link href="/account">Account</Link>
          <Link href="/admin">Admin</Link>
        </div>
        <div>
          <h4>Help</h4>
          <Link href="/help">Delivery & returns</Link>
          <Link href="/account">Track your order</Link>
          <Link href="/favorites">Favorites</Link>
        </div>
      </div>
      <div className="base">© {new Date().getFullYear()} Vasky. All rights reserved.</div>
    </footer>
  );
}

export function Toast() {
  const { toast } = useStore();
  if (!toast) return null;
  return (
    <div className="toast">
      <span>{toast.msg}</span>
      {toast.link && <Link href={toast.link.href}>{toast.link.label}</Link>}
    </div>
  );
}

export default function Layout({ children }) {
  return (
    <>
      <Navbar />
      <main className="page">{children}</main>
      <Footer />
      <Toast />
      <a
        href="https://wa.me/96181283591?text=Hi%20Vasky!%20I%20need%20help%20with%20shoes."
        target="_blank"
        rel="noreferrer"
        aria-label="Chat on WhatsApp"
        className="wa-float"
      >
        <img src="/whatsapp.svg" alt="WhatsApp" width="28" height="28" />
      </a>
    </>
  );
}
