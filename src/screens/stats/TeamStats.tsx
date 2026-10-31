import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { T, TEAM_ORDER, sessionShort, shortName, teams } from "../../data";
import { fmtPoints, scoringSessions } from "../../lib/scoring";
import { marginOf, sideMargin, teamSessionLines, worm } from "../../lib/stats";
import type { Match } from "../../lib/types";
import { ChartCard, signed, useWidth } from "../../charts";
import { Avatar, Chips, TeamDot, playerHref } from "../../components";

const matchupOptions = (): [string, string][] => Object.entries(T.matchups).map(([k, m]) => [k, m.label]);

function MatchLine({ m }: { m: Match }) {
  const mu = T.matchups[m.matchup];
  const winTeam = m.winner === "home" ? mu.home : m.winner === "away" ? mu.away : null;
  const side = (s: "home" | "away") => (
    <span className={m.winner !== "halved" && m.winner !== s ? "muted" : ""}>
      <TeamDot id={m[s].team} />{" "}
      {m[s].players.map((n, i) => (
        <span key={n}>
          {i > 0 && " & "}
          <Link to={playerHref(n)} className="who">
            <Avatar name={n} size={18} />
            {n}
          </Link>
        </span>
      ))}
    </span>
  );
  return (
    <div className="mline">
      {side("home")}
      <b className="num">{winTeam ? `${shortName(winTeam)} ${m.result}` : "Halved"}</b>
      {side("away")}
      {m.note && <small>{m.note}</small>}
    </div>
  );
}

/* ---------- Race chart: running score through the 16 matches ---------- */

function Race() {
  const [mk, setMk] = useState(Object.keys(T.matchups)[0]);
  const [view, setView] = useState<"race" | "lead">("race");
  const steps = useMemo(() => worm(T, mk), [mk]);
  const [sel, setSel] = useState<number | null>(null);
  const [ref, w] = useWidth<HTMLDivElement>();
  const mu = T.matchups[mk];
  const n = steps.length;
  const i = sel == null || sel >= n ? n - 1 : sel;
  const cur = steps[i];
  const half = scoringSessions(T).length > 1 ? steps.filter((s) => s.match.session === scoringSessions(T)[0]).length : 0;

  const h = 230;
  const pad = { l: 30, r: view === "race" ? 78 : 14, t: 14, b: 30 };
  const x = (k: number) => pad.l + (k / n) * (w - pad.l - pad.r);
  const total = n; // one point per match
  const clinch = total / 2 + 0.5;
  const yMax = Math.ceil(Math.max(clinch, ...steps.map((s) => Math.max(s.home, s.away))) + 0.5);
  const leads = steps.map((s) => s.home - s.away);
  const lMax = Math.max(2, ...leads.map(Math.abs));
  const y = (v: number) => (view === "race" ? h - pad.b - (v / yMax) * (h - pad.t - pad.b) : pad.t + ((lMax - v) / (2 * lMax)) * (h - pad.t - pad.b));

  const linePath = (side: "home" | "away") => `M${x(0)} ${y(0)} ` + steps.map((s, k) => `L${x(k + 1)} ${y(s[side])}`).join(" ");
  const ticks = view === "race" ? Array.from({ length: Math.floor(yMax / 2) + 1 }, (_, k) => k * 2) : [-lMax, 0, lMax].map(Math.round);

  // Direct end labels, nudged apart when the lines finish level.
  const endY = { home: y(steps[n - 1].home), away: y(steps[n - 1].away) };
  if (Math.abs(endY.home - endY.away) < 16) {
    const mid = (endY.home + endY.away) / 2;
    endY.home = mid - 8;
    endY.away = mid + 8;
  }
  const bw = Math.max(6, ((w - pad.l - pad.r) / n) * 0.7);

  return (
    <ChartCard
      title="The race"
      sub="Running score after every match. Tap or hover a match to see what happened."
      controls={
        <>
          <Chips label="Contest" value={mk} onChange={(v) => { setMk(v); setSel(null); }} options={matchupOptions()} />
          <Chips label="View" value={view} onChange={(v) => setView(v as "race" | "lead")} options={[["race", "Running score"], ["lead", "Lead"]]} />
        </>
      }
      foot={cur && <MatchLine m={cur.match} />}
    >
      <div className="readout" aria-live="polite">
        <span className="eyebrow">
          After match {i + 1} of {n} · {sessionShort(cur.match.session)}
        </span>
        <span className="readout-score num">
          <TeamDot id={mu.home} /> {shortName(mu.home)} {fmtPoints(cur.home)} – {fmtPoints(cur.away)} {shortName(mu.away)} <TeamDot id={mu.away} />
        </span>
      </div>
      <div ref={ref} className="plot">
        <svg width={w} height={h} role="img" aria-label={`${mu.label}: final ${fmtPoints(steps[n - 1].home)} to ${fmtPoints(steps[n - 1].away)}`}>
          {ticks.map((t) => (
            <g key={t}>
              <line className="grid" x1={pad.l} x2={w - pad.r} y1={y(t)} y2={y(t)} />
              <text className="axis" x={pad.l - 6} y={y(t) + 4} textAnchor="end">
                {view === "lead" ? Math.abs(t) : t}
              </text>
            </g>
          ))}
          {half > 0 && (
            <g>
              <line className="divider" x1={x(half)} x2={x(half)} y1={pad.t - 6} y2={h - pad.b} />
              <text className="axis" x={x(half / 2)} y={h - 8} textAnchor="middle">Scramble</text>
              <text className="axis" x={x(half + (n - half) / 2)} y={h - 8} textAnchor="middle">Alt shot</text>
            </g>
          )}
          {view === "race" ? (
            <>
              <line className="target" x1={pad.l} x2={w - pad.r} y1={y(clinch)} y2={y(clinch)} />
              <text className="axis" x={pad.l + 4} y={y(clinch) - 5}>{fmtPoints(clinch)} clinches</text>
              {(["home", "away"] as const).map((s) => (
                <path key={s} className={`ln s-${mu[s]}`} d={linePath(s)} />
              ))}
              {(["home", "away"] as const).map((s) => (
                <g key={s}>
                  <circle className={`dot f-${mu[s]}`} cx={x(i + 1)} cy={y(cur[s])} r={5} />
                  <text className="end-label" x={w - pad.r + 8} y={endY[s] + 4}>
                    {shortName(mu[s])} {fmtPoints(steps[n - 1][s])}
                  </text>
                </g>
              ))}
            </>
          ) : (
            <>
              <text className="axis" x={w - pad.r} y={pad.t + 10} textAnchor="end">{shortName(mu.home)} ahead ↑</text>
              <text className="axis" x={w - pad.r} y={h - pad.b - 6} textAnchor="end">{shortName(mu.away)} ahead ↓</text>
              {leads.map((l, k) => {
                const top = Math.min(y(l), y(0));
                const hh = Math.max(2, Math.abs(y(l) - y(0)));
                const team = l > 0 ? mu.home : l < 0 ? mu.away : null;
                return <rect key={k} className={team ? `bar f-${team}` : "bar f-level"} x={x(k + 1) - bw / 2 - (x(1) - x(0)) / 2} y={l === 0 ? y(0) - 1 : top} width={bw} height={hh} rx={2} opacity={k === i ? 1 : 0.75} />;
              })}
              <line className="zero" x1={pad.l} x2={w - pad.r} y1={y(0)} y2={y(0)} />
            </>
          )}
          {view === "race" && <line className="cursor" x1={x(i + 1)} x2={x(i + 1)} y1={pad.t} y2={h - pad.b} />}
          {steps.map((_, k) => (
            <rect
              key={k}
              className="hit"
              x={view === "race" ? x(k + 0.5) : x(k)}
              y={0}
              width={x(1) - x(0)}
              height={h}
              onPointerEnter={(e) => e.pointerType === "mouse" && setSel(k)}
              onClick={() => setSel(k)}
            >
              <title>Match {k + 1}</title>
            </rect>
          ))}
        </svg>
      </div>
    </ChartCard>
  );
}

/* ---------- Session split: each team's output by format ---------- */

type Metric = "points" | "wins" | "net";

function SessionSplit() {
  const [metric, setMetric] = useState<Metric>("points");
  const lines = useMemo(() => teamSessionLines(T), []);
  const sessions = scoringSessions(T);
  const val = (id: string, s: string) => {
    const l = lines.get(id as never)?.get(s);
    if (!l) return 0;
    return metric === "points" ? l.points : metric === "wins" ? l.wins : l.net;
  };
  const all = TEAM_ORDER.flatMap((id) => sessions.map((s) => val(id, s)));
  const max = Math.max(1, ...all.map(Math.abs));
  const diverging = metric === "net";
  const fmt = (v: number) => (metric === "net" ? signed(v) : metric === "points" ? fmtPoints(v) : String(v));
  const fmtLabel = { points: "Points (of 8)", wins: "Matches won (of 8)", net: "Net holes up" }[metric];

  return (
    <ChartCard
      title="Scramble vs alternate shot"
      sub="How each team did in each format. Net holes adds up every winning margin and subtracts every losing one, so a 5&4 counts more than a 1UP."
      controls={<Chips label="Measure" value={metric} onChange={(v) => setMetric(v as Metric)} options={[["points", "Points"], ["wins", "Wins"], ["net", "Net holes"]]} />}
    >
      <div className="hbars" role="table" aria-label={fmtLabel}>
        {TEAM_ORDER.map((id) => (
          <div className="hbar-group" key={id} role="rowgroup">
            <div className="hbar-team">
              <TeamDot id={id} /> {teams[id].name}
              {teams[id].status === "eliminated" && <span className="muted"> · out</span>}
            </div>
            {sessions.map((s) => {
              const v = val(id, s);
              const pct = (Math.abs(v) / max) * (diverging ? 50 : 100);
              return (
                <div className="hbar-row" key={s} role="row" title={`${teams[id].name}, ${sessionShort(s)}: ${fmt(v)}`}>
                  <span className="hbar-label" role="rowheader">{T.sessions[s].format === "scramble" ? "Scramble" : "Alt shot"}</span>
                  <span className={`hbar-track ${diverging ? "div" : ""}`} role="cell">
                    <i
                      className={`f-${id} ${s !== sessions[0] ? "tex" : ""}`}
                      style={diverging ? (v >= 0 ? { left: "50%", width: `${pct}%` } : { right: "50%", width: `${pct}%` }) : { width: `${pct}%` }}
                    />
                  </span>
                  <span className="hbar-val num" role="cell">{fmt(v)}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </ChartCard>
  );
}

/* ---------- Every match as a margin bar ---------- */

function Margins() {
  const [mk, setMk] = useState(Object.keys(T.matchups)[0]);
  const [sess, setSess] = useState("all");
  const [sel, setSel] = useState<string | null>(null);
  const mu = T.matchups[mk];
  const list = T.matches.filter((m) => m.matchup === mk && scoringSessions(T).includes(m.session) && (sess === "all" || m.session === sess));
  const maxM = Math.max(4, ...T.matches.map((m) => marginOf(m.result)));
  const selM = list.find((m) => m.id === sel) ?? null;

  return (
    <ChartCard
      title="Every match, by margin"
      sub={
        <>
          Bars grow toward the side that won. Longer bar, bigger blowout. A diamond means halved.
        </>
      }
      controls={
        <>
          <Chips label="Contest" value={mk} onChange={(v) => { setMk(v); setSel(null); }} options={matchupOptions()} />
          <Chips label="Session" value={sess} onChange={setSess} options={[["all", "Both sessions"], ...scoringSessions(T).map((s) => [s, sessionShort(s)] as [string, string])]} />
        </>
      }
      foot={selM ? <MatchLine m={selM} /> : <p className="hint">Tap a row for the full match.</p>}
    >
      <div className="mg">
        <div className="mg-head">
          <span><TeamDot id={mu.home} /> {shortName(mu.home)} won</span>
          <span>{shortName(mu.away)} won <TeamDot id={mu.away} /></span>
        </div>
        {list.map((m, k) => {
          const mg = sideMargin(m, "away");
          const pct = (Math.abs(mg) / maxM) * 50;
          const team = mg > 0 ? mu.away : mg < 0 ? mu.home : null;
          const prev = list[k - 1];
          return (
            <div key={m.id}>
              {sess === "all" && (!prev || prev.session !== m.session) && <div className="mg-sess eyebrow">{sessionShort(m.session)}</div>}
              <button type="button" className="mg-row" aria-pressed={sel === m.id} onClick={() => setSel(sel === m.id ? null : m.id)}>
                <span className={`mg-names l ${m.winner === "away" ? "muted" : ""}`}>{m.home.players.join(" & ")}</span>
                <span className={`mg-names r ${m.winner === "home" ? "muted" : ""}`}>{m.away.players.join(" & ")}</span>
                <span className="mg-track">
                  {team ? (
                    <i className={`f-${team}`} style={mg > 0 ? { left: "50%", width: `${pct}%` } : { right: "50%", width: `${pct}%` }} />
                  ) : (
                    <b className="mg-half" />
                  )}
                  <em className="num" style={mg > 0 ? { right: "calc(50% + 6px)" } : { left: `calc(50% + ${team ? 6 : 12}px)` }}>
                    {m.result}
                  </em>
                </span>
              </button>
            </div>
          );
        })}
      </div>
    </ChartCard>
  );
}

export default function TeamStats() {
  return (
    <>
      <Race />
      <div className="chart-grid">
        <SessionSplit />
        <Margins />
      </div>
    </>
  );
}
