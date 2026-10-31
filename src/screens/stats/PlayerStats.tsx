import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { T, TEAM_ORDER, records, shortName, teams } from "../../data";
import { fmtPoints } from "../../lib/scoring";
import { handicapValue, pairLines, playerLines, type PlayerLine } from "../../lib/stats";
import type { TeamId } from "../../lib/types";
import { ChartCard, hcpLabel, signed, useWidth } from "../../charts";
import { Avatar, Chips, RecordChips, TeamDot, playerHref } from "../../components";

const hcpOf = new Map<string, number | null>();
for (const t of T.teams) for (const p of t.players) hcpOf.set(p.name, handicapValue(p.handicap));

const teamOptions = (): [string, string][] => [["all", "All teams"], ...TEAM_ORDER.map((id) => [id, shortName(id)] as [string, string])];

/* ---------- Leaderboard: players or pairs, by points or net holes ---------- */

function Leaderboard() {
  const [mode, setMode] = useState<"players" | "pairs">("players");
  const [metric, setMetric] = useState<"points" | "net">("net");
  const [team, setTeam] = useState("all");
  const [all, setAll] = useState(false);
  const players = useMemo(() => playerLines(T), []);
  const pairs = useMemo(() => pairLines(T), []);

  const rows = useMemo(() => {
    const base =
      mode === "players"
        ? players.map((p) => ({ key: p.name, names: [p.name], team: p.team, points: p.points, net: p.net, sub: p }))
        : pairs.map((p) => ({ key: p.match.id + p.side, names: [...p.players], team: p.team, points: p.match.winner === "halved" ? 0.5 : p.margin > 0 ? 1 : 0, net: p.margin, sub: null }));
    return base
      .filter((r) => team === "all" || r.team === team)
      .sort((a, b) => b[metric] - a[metric] || b.net - a.net || a.names[0].localeCompare(b.names[0]));
  }, [mode, metric, team, players, pairs]);

  const max = Math.max(1, ...rows.map((r) => Math.abs(r[metric])));
  const diverging = metric === "net";
  const shown = all ? rows : rows.slice(0, 12);

  return (
    <ChartCard
      title="Leaderboard"
      sub="Points are what count. Net holes shows how convincingly: every hole won by, minus every hole lost by, across Day 1."
      controls={
        <>
          <Chips label="Show" value={mode} onChange={(v) => setMode(v as "players" | "pairs")} options={[["players", "Players"], ["pairs", "Pairings"]]} />
          <Chips label="Measure" value={metric} onChange={(v) => setMetric(v as "points" | "net")} options={[["net", "Net holes"], ["points", "Points"]]} />
          <Chips label="Team" value={team} onChange={setTeam} options={teamOptions()} />
        </>
      }
      foot={
        rows.length > 12 && (
          <button type="button" className="clear" onClick={() => setAll(!all)}>
            {all ? "Show top 12" : `Show all ${rows.length}`}
          </button>
        )
      }
    >
      <ol className="lb">
        {shown.map((r, k) => {
          const v = r[metric];
          const pct = (Math.abs(v) / max) * (diverging ? 50 : 100);
          const rank = rows.findIndex((x) => x[metric] === v) + 1;
          return (
            <li key={r.key} className="lb-row">
              <span className="lb-rank num">{k === 0 || rows[k - 1][metric] !== v ? rank : ""}</span>
              <span className="lb-name">
                {r.names.map((n, i) => (
                  <span key={n}>
                    {i > 0 && " & "}
                    <Link to={playerHref(n)} className="lb-person">
                      <Avatar name={n} size={20} />
                      {n}
                    </Link>
                  </span>
                ))}
                {r.sub && <RecordChips marks={records.get(r.sub.name)?.marks ?? []} />}
              </span>
              <span className={`hbar-track ${diverging ? "div" : ""}`} aria-hidden="true">
                <i className={`f-${r.team}`} style={diverging ? (v >= 0 ? { left: "50%", width: `${pct}%` } : { right: "50%", width: `${pct}%` }) : { width: `${pct}%` }} />
              </span>
              <span className="hbar-val num">{metric === "net" ? signed(v) : fmtPoints(v)}</span>
            </li>
          );
        })}
      </ol>
    </ChartCard>
  );
}

/* ---------- Scatter: handicap vs net holes ---------- */

function Scatter() {
  const lines = useMemo(() => playerLines(T), []);
  const [on, setOn] = useState<Set<TeamId>>(() => new Set(TEAM_ORDER));
  const [sel, setSel] = useState<string | null>(null);
  const [ref, w] = useWidth<HTMLDivElement>();
  const known = lines.filter((l) => hcpOf.get(l.name) != null);
  const pts = known.filter((l) => on.has(l.team));
  const unknown = lines.length - known.length;

  const h = 260;
  const pad = { l: 34, r: 14, t: 24, b: 34 };
  const hv = known.map((l) => hcpOf.get(l.name)!);
  const xMin = Math.floor(Math.min(...hv) - 1);
  const xMax = Math.ceil(Math.max(...hv) + 1);
  const nv = lines.map((l) => l.net);
  const yLim = Math.max(4, ...nv.map(Math.abs)) + 1;
  const x = (v: number) => pad.l + ((v - xMin) / (xMax - xMin)) * (w - pad.l - pad.r);
  const y = (v: number) => pad.t + ((yLim - v) / (2 * yLim)) * (h - pad.t - pad.b);
  const xt: number[] = [];
  for (let v = Math.ceil(xMin / 4) * 4; v <= xMax; v += 4) xt.push(v);
  const yt = [-Math.floor(yLim / 2) * 2, 0, Math.floor(yLim / 2) * 2];
  const cur: PlayerLine | undefined = lines.find((l) => l.name === sel);

  const toggle = (id: TeamId) =>
    setOn((s) => {
      const n = new Set(s);
      if (n.has(id) && n.size > 1) n.delete(id);
      else n.add(id);
      return n;
    });

  return (
    <ChartCard
      title="Handicap vs results"
      sub="Did the low handicaps deliver? Left is better on paper, up is better on the day. Tap a team to hide or show it; tap a dot for the player."
      controls={
        <div className="legend-toggle" role="group" aria-label="Teams shown">
          {TEAM_ORDER.map((id) => (
            <button key={id} type="button" aria-pressed={on.has(id)} onClick={() => toggle(id)}>
              <TeamDot id={id} /> {shortName(id)}
            </button>
          ))}
        </div>
      }
      foot={
        <p className="hint">
          {cur ? (
            <>
              <Avatar name={cur.name} size={22} /> <Link to={playerHref(cur.name)}><b>{cur.name}</b></Link> · handicap {teams[cur.team].players.find((p) => p.name === cur.name)?.handicap} · {fmtPoints(cur.points)} pts · net {signed(cur.net)} holes
            </>
          ) : (
            <>
              {unknown} players without a published handicap aren't plotted. Average handicap of those plotted:{" "}
              {hcpLabel(hv.reduce((a, b) => a + b, 0) / hv.length)}.
            </>
          )}
        </p>
      }
    >
      <div ref={ref} className="plot">
        <svg width={w} height={h} role="img" aria-label="Scatter of handicap against net holes for each player with a known handicap">
          {xt.map((v) => (
            <g key={`x${v}`}>
              <line className="grid" x1={x(v)} x2={x(v)} y1={pad.t} y2={h - pad.b} />
              <text className="axis" x={x(v)} y={h - pad.b + 16} textAnchor="middle">{hcpLabel(v)}</text>
            </g>
          ))}
          {yt.map((v) => (
            <g key={`y${v}`}>
              <line className={v === 0 ? "zero" : "grid"} x1={pad.l} x2={w - pad.r} y1={y(v)} y2={y(v)} />
              <text className="axis" x={pad.l - 6} y={y(v) + 4} textAnchor="end">{signed(v)}</text>
            </g>
          ))}
          <text className="axis" x={pad.l} y={h - 4}>← better handicap</text>
          <text className="axis" x={w - pad.r} y={h - 4} textAnchor="end">Handicap</text>
          <text className="axis" x={pad.l - 28} y={12}>Net holes ↑</text>
          {pts.map((l) => (
            <circle
              key={l.name}
              className={`pt f-${l.team} ${sel === l.name ? "sel" : ""}`}
              cx={x(hcpOf.get(l.name)!)}
              cy={y(l.net)}
              r={sel === l.name ? 8 : 6}
              tabIndex={0}
              onPointerEnter={(e) => e.pointerType === "mouse" && setSel(l.name)}
              onFocus={() => setSel(l.name)}
              onClick={() => setSel(l.name)}
            >
              <title>{`${l.name}: ${hcpLabel(hcpOf.get(l.name)!)}, net ${signed(l.net)}`}</title>
            </circle>
          ))}
          {cur && hcpOf.get(cur.name) != null && on.has(cur.team) && (
            <text className="end-label" x={Math.min(x(hcpOf.get(cur.name)!) + 10, w - pad.r - 4)} y={y(cur.net) - 10} textAnchor={x(hcpOf.get(cur.name)!) > w - 120 ? "end" : "start"}>
              {cur.name}
            </text>
          )}
        </svg>
      </div>
    </ChartCard>
  );
}

/* ---------- Strip plot: handicap spread on each roster ---------- */

function Spread() {
  const all = T.teams.flatMap((t) => t.players.map((p) => handicapValue(p.handicap))).filter((v): v is number => v != null);
  const lo = Math.floor(Math.min(...all)) - 1;
  const hi = Math.ceil(Math.max(...all)) + 1;
  const pos = (v: number) => `${((v - lo) / (hi - lo)) * 100}%`;
  const ticks: number[] = [];
  for (let v = Math.ceil(lo / 4) * 4; v <= hi; v += 4) ticks.push(v);

  return (
    <ChartCard title="Roster strength on paper" sub="Every published handicap on each team. The tick is the team's median.">
      <div className="strip">
        {TEAM_ORDER.map((id) => {
          const ps = teams[id].players.map((p) => ({ name: p.name, v: handicapValue(p.handicap) })).filter((p): p is { name: string; v: number } => p.v != null);
          const sorted = ps.map((p) => p.v).sort((a, b) => a - b);
          const med = sorted.length ? (sorted[(sorted.length - 1) >> 1] + sorted[sorted.length >> 1]) / 2 : null;
          return (
            <div className="strip-row" key={id}>
              <span className="strip-label">
                <TeamDot id={id} /> {shortName(id)}
                <small className="muted">{ps.length}/16 known</small>
              </span>
              <span className="strip-track">
                {ps.map((p) => (
                  <i key={p.name} className={`f-${id}`} style={{ left: pos(p.v) }} title={`${p.name}: ${hcpLabel(p.v)}`} />
                ))}
                {med != null && <b style={{ left: pos(med) }} title={`Median ${hcpLabel(med)}`} />}
              </span>
              <span className="hbar-val num">{med != null ? hcpLabel(med) : "n/a"}</span>
            </div>
          );
        })}
        <div className="strip-row strip-axis" aria-hidden="true">
          <span />
          <span className="strip-track">
            {ticks.map((v) => (
              <em key={v} style={{ left: pos(v) }}>{hcpLabel(v)}</em>
            ))}
          </span>
          <span />
        </div>
      </div>
    </ChartCard>
  );
}

export default function PlayerStats() {
  return (
    <>
      <Leaderboard />
      <div className="chart-grid">
        <Scatter />
        <Spread />
      </div>
    </>
  );
}
