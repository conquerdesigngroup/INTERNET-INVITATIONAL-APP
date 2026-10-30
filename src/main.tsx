import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import App from "./App";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
    <Analytics />
    <SpeedInsights />
  </StrictMode>,
);

// Parallax: the turf texture moves at a quarter of scroll speed, wrapped to its 480px tile.
if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  let frame = 0;
  const root = document.documentElement;
  window.addEventListener(
    "scroll",
    () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        root.style.setProperty("--py", `${((window.scrollY * 0.25) % 480).toFixed(1)}px`);
      });
    },
    { passive: true },
  );
}

// Glass sheen follows the pointer across whichever card it is over (mouse and pen only).
if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
  let last: HTMLElement | null = null;
  document.addEventListener(
    "pointermove",
    (e) => {
      const card = (e.target as Element | null)?.closest?.<HTMLElement>(".card") ?? null;
      if (last && last !== card) {
        last.style.removeProperty("--mx");
        last.style.removeProperty("--my");
      }
      last = card;
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
    },
    { passive: true },
  );
}

if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js").catch(() => {}));
}
