// Scroll-reveal wrapper: fades/slides content in once when visible.
// Transform + opacity only (GPU cheap), disabled for reduced-motion users.
import { useEffect, useRef, useState } from "react";

export default function Reveal({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") { setInView(true); return; }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={"reveal" + (inView ? " in" : "") + (className ? " " + className : "")} style={{ transitionDelay: delay + "ms" }}>
      {children}
    </div>
  );
}
