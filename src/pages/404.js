import Link from "next/link";

export default function NotFound() {
  return (
    <div className="wrap" style={{ padding: "80px 20px", textAlign: "center" }}>
      <p className="kicker">404</p>
      <h1 className="title">Lost your step?</h1>
      <p className="muted">That page doesn&apos;t exist.</p>
      <Link href="/" className="btn" style={{ display: "inline-block", marginTop: 16 }}>BACK HOME</Link>
    </div>
  );
}
