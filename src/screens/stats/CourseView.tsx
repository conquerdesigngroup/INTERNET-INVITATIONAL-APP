import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { T, sessionShort } from "../../data";
import { DAY1_COURSE, HOLES, HOLE_MOMENTS, NINES, RESORT, appleMapsLink, type Hole } from "../../course";
import { holeTallies } from "../../lib/stats";
import { ChartCard, useWidth } from "../../charts";
import { Chips } from "../../components";

const satLink = (lat: number, lon: number) => `https://www.google.com/maps/@?api=1&map_action=map&center=${lat},${lon}&zoom=16&basemap=satellite`;

/** Which session played a hole, and the hole's position within that nine (0-based). */
function nineOf(n: number) {
  const nine = [...NINES].reverse().find((x) => n >= x.first) ?? NINES[0];
  return { ...nine, idx: n - nine.first };
}

/* ---------- Big Cedar Lodge: where each course sits ---------- */

function ResortMap() {
  const [ref, w] = useWidth<HTMLDivElement>();
  const [sel, setSel] = useState(RESORT[0].name);
  const lats = RESORT.map((c) => c.lat);
  const lons = RESORT.map((c) => c.lon);
  const k = Math.cos((36.56 * Math.PI) / 180);
  const [la0, la1] = [Math.min(...lats) - 0.006, Math.max(...lats) + 0.006];
  const [lo0, lo1] = [Math.min(...lons) - 0.012, Math.max(...lons) + 0.012];
  const spanX = (lo1 - lo0) * k;
  const spanY = la1 - la0;
  const h = Math.round(Math.min(360, Math.max(220, (w * spanY) / spanX)));
  const s = Math.min(w / spanX, h / spanY);
  const ox = (w - spanX * s) / 2;
  const oy = (h - spanY * s) / 2;
  const px = (lon: number) => ox + (lon - lo0) * k * s;
  const py = (lat: number) => oy + (la1 - lat) * s;
  const kmPx = s / 111; // degrees of latitude per km ≈ 1/111
  const cur = RESORT.find((c) => c.name === sel)!;

  return (
    <ChartCard
      title="Big Cedar Lodge"
      sub="The resort's courses outside Branson, Missouri. Day 1 was played at Ozarks National. Tap a pin."
      foot={
        <div className="map-card">
          <div>
            <b>{cur.name}</b>
            <span className="muted"> · {cur.designer} · {cur.kind}</span>
            {cur.role && <div className="pill exp">{cur.role}</div>}
          </div>
          <div className="map-links">
            <a className="btn" href={satLink(cur.lat, cur.lon)} target="_blank" rel="noopener">Satellite · Google Maps</a>
            <a className="btn" href={appleMapsLink(cur.lat, cur.lon, cur.name)} target="_blank" rel="noopener">Apple Maps</a>
          </div>
        </div>
      }
    >
      <div ref={ref} className="plot map">
        <svg width={w} height={h} role="img" aria-label="Map of Big Cedar Lodge golf courses">
          <defs>
            <pattern id="topo" width="22" height="22" patternUnits="userSpaceOnUse">
              <path d="M0 11 Q5.5 6 11 11 T22 11" className="topo" />
            </pattern>
          </defs>
          <rect x="0" y="0" width={w} height={h} className="map-bg" />
          <rect x="0" y="0" width={w} height={h} fill="url(#topo)" />
          {RESORT.map((c) => {
            const on = c.name === sel;
            const left = px(c.lon) > w - 130;
            return (
              <g key={c.name} className={`pin ${on ? "on" : ""} ${c.role ? "used" : ""}`} transform={`translate(${px(c.lon)} ${py(c.lat)})`} onClick={() => setSel(c.name)} tabIndex={0} onFocus={() => setSel(c.name)} role="button" aria-label={c.name}>
                <circle r="22" className="pin-hit" />
                <path d="M0 0 C-7 -9 -9 -13 -9 -17 A9 9 0 1 1 9 -17 C9 -13 7 -9 0 0Z" className="pin-body" />
                <circle cy="-17" r="3.5" className="pin-dot" />
                <text x={left ? -14 : 14} y="-12" textAnchor={left ? "end" : "start"} className="pin-label">{c.name}</text>
              </g>
            );
          })}
          <g transform={`translate(${w - 16} ${h - 16})`} className="scale">
            <line x1={-kmPx} x2="0" y1="0" y2="0" />
            <line x1={-kmPx} x2={-kmPx} y1="-4" y2="0" />
            <line x1="0" x2="0" y1="-4" y2="0" />
            <text x={-kmPx / 2} y="-7" textAnchor="middle">1 km</text>
          </g>
          <g transform="translate(22 26)" className="scale">
            <path d="M0 -12 L5 4 L0 0 L-5 4Z" />
            <text y="16" textAnchor="middle">N</text>
          </g>
        </svg>
      </div>
    </ChartCard>
  );
}

/* ---------- Hole explorer: the scorecard as a chart ---------- */

type HoleMetric = "live" | "decided" | "yards";

function HoleChart({ sel, setSel }: { sel: number; setSel: (n: number) => void }) {
  const [metric, setMetric] = useState<HoleMetric>("live");
  const tallies = useMemo(() => Object.fromEntries(NINES.map((n) => [n.session, holeTallies(T, n.session)])), []);
  const [ref, w] = useWidth<HTMLDivElement>();
  const val = (hole: Hole) => {
    if (metric === "yards") return hole.yards;
    const nn = nineOf(hole.n);
    return tallies[nn.session]?.[nn.idx]?.[metric] ?? 0;
  };
  const max = metric === "yards" ? 600 : 16;
  const h = 200;
  const pad = { l: 28, r: 6, t: 18, b: 40 };
  const step = (w - pad.l - pad.r) / HOLES.length;
  const bw = Math.max(8, step - 4);
  const x = (i: number) => pad.l + i * step + (step - bw) / 2;
  const y = (v: number) => h - pad.b - (v / max) * (h - pad.t - pad.b);
  const ticks = metric === "yards" ? [0, 200, 400, 600] : [0, 4, 8, 12, 16];
  const label = { live: "Matches still going when they reached each hole", decided: "Matches that finished on each hole", yards: "Yards from the back tees" }[metric];

  return (
    <ChartCard
      title="Ozarks National, hole by hole"
      sub={`${DAY1_COURSE.designer}, par ${DAY1_COURSE.par}, ${DAY1_COURSE.yards.toLocaleString("en-US")} yards. The scramble played the front nine and the alternate shot played the back nine. ${label}.`}
      controls={<Chips label="Measure" value={metric} onChange={(v) => setMetric(v as HoleMetric)} options={[["live", "Still going"], ["decided", "Finished here"], ["yards", "Yardage"]]} />}
    >
      <div className="legend">
        {NINES.map((n) => (
          <span key={n.session}>
            <i className={`sw nine-${n.session}`} /> {n.label}
          </span>
        ))}
      </div>
      <div ref={ref} className="plot">
        <svg width={w} height={h} role="img" aria-label={label}>
          {ticks.map((t) => (
            <g key={t}>
              <line className={t === 0 ? "zero" : "grid"} x1={pad.l} x2={w - pad.r} y1={y(t)} y2={y(t)} />
              <text className="axis" x={pad.l - 5} y={y(t) + 4} textAnchor="end">{t}</text>
            </g>
          ))}
          {HOLES.map((hole, i) => {
            const v = val(hole);
            const nn = nineOf(hole.n);
            const on = hole.n === sel;
            return (
              <g key={hole.n} onClick={() => setSel(hole.n)} onPointerEnter={(e) => e.pointerType === "mouse" && setSel(hole.n)} className="hole-col">
                <rect className="hit" x={pad.l + i * step} y={0} width={step} height={h} />
                <rect className={`bar nine-${nn.session} ${on ? "sel" : ""}`} x={x(i)} y={v ? y(v) : y(0) - 1} width={bw} height={v ? y(0) - y(v) : 1} rx={2} />
                {on && (
                  <text className="end-label" x={x(i) + bw / 2} y={y(v) - 5} textAnchor="middle">{v}</text>
                )}
                <text className={`axis ${on ? "axis-on" : ""}`} x={x(i) + bw / 2} y={h - pad.b + 14} textAnchor="middle">{hole.n}</text>
                <text className="axis small" x={x(i) + bw / 2} y={h - pad.b + 27} textAnchor="middle">{`P${hole.par}`}</text>
                {hole.n === 18 && <title>18 · also the playoff hole</title>}
              </g>
            );
          })}
        </svg>
      </div>
    </ChartCard>
  );
}

function HoleDrawing({ hole }: { hole: Hole }) {
  const [ref, w] = useWidth<HTMLDivElement>();
  const h = 70;
  const len = 40 + (hole.yards / 620) * (w - 70);
  const gx = 20 + len;
  return (
    <div ref={ref} className="plot">
      <svg width={w} height={h} role="img" aria-label={`Par ${hole.par}, ${hole.yards} yards`}>
        {hole.par > 3 ? <path className="fair" d={`M${44} ${h / 2 - 9} L${gx - 18} ${h / 2 - 13} Q${gx} ${h / 2} ${gx - 18} ${h / 2 + 13} L44 ${h / 2 + 9} Z`} /> : <line className="carry" x1={30} x2={gx - 16} y1={h / 2} y2={h / 2} />}
        <rect className="svg-ink" x={14} y={h / 2 - 6} width={12} height={12} rx={2} />
        <circle className="green" cx={gx} cy={h / 2} r={16} />
        <line className="flagpole" x1={gx} x2={gx} y1={h / 2} y2={h / 2 - 22} />
        <path className="flag" d={`M${gx} ${h / 2 - 22} l10 4 l-10 4z`} />
        <text className="svg-small" x={20} y={h - 4} textAnchor="middle">Tee</text>
        <text className="svg-small" x={Math.min(gx, w - 30)} y={h - 2} textAnchor="middle">{hole.yards} yds</text>
      </svg>
    </div>
  );
}

function HoleDetail({ n, setSel }: { n: number; setSel: (n: number) => void }) {
  const hole = HOLES[n - 1];
  const nn = nineOf(n);
  const tally = holeTallies(T, nn.session)[nn.idx];
  const moments = HOLE_MOMENTS.filter((m) => m.hole === n);
  const playoff = T.matches.filter((m) => T.sessions[m.session]?.countsTowardPoints === false);
  return (
    <article className="card hole-detail" aria-live="polite">
      <div className="hole-nav">
        <button type="button" className="btn" onClick={() => setSel(n === 1 ? 18 : n - 1)} aria-label="Previous hole">‹</button>
        <div>
          <span className="eyebrow">{nn.label}</span>
          <h3>Hole {n}</h3>
        </div>
        <button type="button" className="btn" onClick={() => setSel(n === 18 ? 1 : n + 1)} aria-label="Next hole">›</button>
      </div>
      <div className="team-stats">
        <div><b className="num">{hole.par}</b><span>Par</span></div>
        <div><b className="num">{hole.yards}</b><span>Yards</span></div>
        <div><b className="num">{hole.hcp}</b><span>Stroke index</span></div>
        <div><b className="num">{tally.live}</b><span>Matches played it</span></div>
        <div><b className="num">{tally.decided}</b><span>Finished here</span></div>
      </div>
      <HoleDrawing hole={hole} />
      {n === 18 && playoff.length > 0 && (
        <p className="pill exp">Also the playoff hole · played {playoff.length} more times in sudden death</p>
      )}
      {moments.length > 0 ? (
        <ul className="moments-list">
          {moments.map((m) => (
            <li key={m.text}>
              {m.text}{" "}
              {m.match && (
                <Link to={`/matches?session=${T.matches.find((x) => x.id === m.match)?.session}&matchup=${T.matches.find((x) => x.id === m.match)?.matchup}`}>See the match</Link>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="hint">No standout moment reported on this hole yet. {sessionShort(nn.session)}.</p>
      )}
    </article>
  );
}

function Scorecard({ sel, setSel }: { sel: number; setSel: (n: number) => void }) {
  return (
    <div className="scorecard hscroll" role="group" aria-label="Pick a hole">
      {HOLES.map((h) => (
        <button key={h.n} type="button" className={`sc-hole nine-b-${nineOf(h.n).session}`} aria-pressed={h.n === sel} onClick={() => setSel(h.n)}>
          <b>{h.n}</b>
          <span>Par {h.par}</span>
          <span className="num">{h.yards}</span>
        </button>
      ))}
    </div>
  );
}

export default function CourseView() {
  const [sel, setSel] = useState(18);
  return (
    <>
      <HoleChart sel={sel} setSel={setSel} />
      <Scorecard sel={sel} setSel={setSel} />
      <HoleDetail n={sel} setSel={setSel} />
      <ResortMap />
      <p className="footnote">
        Scorecard and course locations from{" "}
        <a href={DAY1_COURSE.scorecardSource} target="_blank" rel="noopener">OpenGolfAPI</a>. Yardages are the back tees; the show may have used
        a different setup. Pins are approximate course centers. Which nine each session played comes from the Forbes and The Big Lead recaps.
      </p>
    </>
  );
}
