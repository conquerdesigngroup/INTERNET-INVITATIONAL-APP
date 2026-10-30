import { useEffect, useState } from "react";
import { Navigate, NavLink, Route, Routes, useLocation } from "react-router-dom";
import { T, epDate, epName, nextEpisode, playersAlive } from "./data";
import Standings from "./screens/Standings";
import Teams from "./screens/Teams";
import Matches from "./screens/Matches";
import Format from "./screens/Format";

const TABS = [
  { to: "/standings", label: "Standings", icon: <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /> },
  { to: "/teams", label: "Teams", icon: <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c.6-3.6 3.2-5.5 6.5-5.5s5.9 1.9 6.5 5.5M16 4.8a3.5 3.5 0 0 1 0 6.4M18 14.8c2 .7 3.2 2.4 3.5 5.2" /></> },
  { to: "/matches", label: "Matches", icon: <><rect x="3" y="4" width="18" height="7" rx="2" /><rect x="3" y="13" width="18" height="7" rx="2" /></> },
  { to: "/format", label: "Format", longLabel: "Format & Bracket", icon: <path d="M3 5h5v5H3zM3 14h5v5H3zM8 7.5h3v9H8M11 12h4M15 9.5h6v5h-6z" /> },
];

type Theme = "auto" | "light" | "dark";

function useTheme(): [Theme, () => void] {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const v = localStorage.getItem("ii26-theme");
      return v === "light" || v === "dark" ? v : "auto";
    } catch {
      return "auto";
    }
  });
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "auto") delete root.dataset.theme;
    else root.dataset.theme = theme;
    try {
      if (theme === "auto") localStorage.removeItem("ii26-theme");
      else localStorage.setItem("ii26-theme", theme);
    } catch {
      /* storage unavailable */
    }
  }, [theme]);
  const cycle = () => setTheme((t) => (t === "auto" ? "light" : t === "light" ? "dark" : "auto"));
  return [theme, cycle];
}

function ThemeButton() {
  const [theme, cycle] = useTheme();
  const label = { auto: "Theme: match device", light: "Theme: light", dark: "Theme: dark" }[theme];
  return (
    <button type="button" className="theme-btn" onClick={cycle} aria-label={`${label}. Tap to change.`} title={label}>
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        {theme === "light" ? (
          <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>
        ) : theme === "dark" ? (
          <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />
        ) : (
          <><circle cx="12" cy="12" r="8.5" /><path d="M12 3.5v17a8.5 8.5 0 0 0 0-17z" fill="currentColor" /></>
        )}
      </svg>
    </button>
  );
}

function Header() {
  const next = nextEpisode();
  return (
    <header className="band">
      <div className="wrap band-inner">
        <div className="band-top">
          <div className="status">
            <i />
            Thru {T.meta.updatedThrough.replace("Episode", "Ep")} · {playersAlive} left
          </div>
          <ThemeButton />
        </div>
        <h1>
          Internet Invitational <span>{T.meta.edition === 2 ? "2026" : T.meta.edition}</span>
        </h1>
        <div className="meta">
          <span>
            <b>{T.meta.venue.split(",")[0]}</b> · Ridgedale, MO
          </span>
          <span className="hide-sm">
            Host <b>{T.meta.host}</b>
          </span>
          <span className="hide-sm">
            Rules official <b>{T.meta.rulesOfficial}</b>
          </span>
          <span>
            Prize <b>${T.meta.prizeTotalUSD.toLocaleString("en-US")}</b>
          </span>
          {next && (
            <span className="next">
              Next <b>{epName(next)} · {epDate(next)}, 1pm ET</b>
            </span>
          )}
        </div>
      </div>
    </header>
  );
}

function Nav() {
  return (
    <nav className="tabs" aria-label="Sections">
      <div className="wrap tabs-inner">
        {TABS.map((t) => (
          <NavLink key={t.to} to={t.to} className="tab">
            <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              {t.icon}
            </svg>
            <span className="tab-short">{t.label}</span>
            <span className="tab-long">{t.longLabel ?? t.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export default function App() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      <Header />
      <Nav />
      <main>
        <div className="wrap">
          <Routes>
            <Route path="/" element={<Navigate to="/standings" replace />} />
            <Route path="/standings" element={<Standings />} />
            <Route path="/teams" element={<Teams />} />
            <Route path="/teams/:teamId" element={<Teams />} />
            <Route path="/matches" element={<Matches />} />
            <Route path="/format" element={<Format />} />
            <Route path="*" element={<Navigate to="/standings" replace />} />
          </Routes>
        </div>
      </main>
      <footer className="foot wrap">
        Fan-made tracker. Results from{" "}
        <a href={T.meta.sources[0]} target="_blank" rel="noopener">
          YT Golf Stats
        </a>
        . Updated {T.meta.updatedAt}.
      </footer>
    </>
  );
}
