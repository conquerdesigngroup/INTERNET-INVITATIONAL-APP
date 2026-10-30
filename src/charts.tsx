import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

/** Width of an element in CSS pixels, kept current on resize, so SVG charts draw at 1:1 and text stays crisp. */
export function useWidth<T extends HTMLElement>(fallback = 340): [React.RefObject<T | null>, number] {
  const ref = useRef<T>(null);
  const [w, setW] = useState(fallback);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const read = () => setW(Math.max(260, Math.round(el.clientWidth)));
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, w];
}

/** A chart card: title, one-line explainer, a row of controls, the plot, then a readout. */
export function ChartCard({
  title,
  sub,
  controls,
  children,
  foot,
}: {
  title: string;
  sub?: ReactNode;
  controls?: ReactNode;
  children: ReactNode;
  foot?: ReactNode;
}) {
  return (
    <article className="card chart">
      <div className="chart-head">
        <h3>{title}</h3>
        {sub && <p>{sub}</p>}
      </div>
      {controls && <div className="chart-controls">{controls}</div>}
      {children}
      {foot && <div className="chart-foot">{foot}</div>}
    </article>
  );
}

/** "+3.9" style label for a handicap value where negative = better than scratch. */
export const hcpLabel = (v: number) => (v < 0 ? `+${+(-v).toFixed(1)}` : v === 0 ? "0" : String(+v.toFixed(1)));

/** "+3" / "−2" / "0" for net holes. */
export const signed = (n: number) => (n > 0 ? `+${n}` : n < 0 ? `−${-n}` : "0");
