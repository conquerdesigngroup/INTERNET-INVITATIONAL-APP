import { Fragment, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { T, epDate, money, playersAlive, sessionShort, shortName, teams } from "../data";
import { matchupBullets, stageDetails, teamBlurbs } from "../content";
import { contestTotal, countingMatches, fmtPoints, holesPlayed, scoringSessions, sessionTotal } from "../lib/scoring";
import { Pill, SecHead, TeamChip } from "../components";

type LinkKind = "on" | "off" | "tbd";
interface BNode {
  id: string;
  col: number;
  cls: string;
  body: ReactNode;
}
interface Detail {
  title: string;
  text: string;
  bullets: string[];
}

const COLS = ["Draft", "Day 1", "Day 2", "Semis", "Final"];
const stage = (id: string) => T.stages.find((s) => s.id === id);
const finale = T.episodes[T.episodes.length - 1];

function buildBracket() {
  const nodes: BNode[] = [];
  const links: [string, string, LinkKind][] = [];
  const details: Record<string, Detail> = {};
  const day1 = stage("day1");
  const day1Done = day1?.status === "complete";

  for (const [mk, mu] of Object.entries(T.matchups)) {
    for (const id of [mu.home, mu.away]) {
      const t = teams[id];
      const out = t.status === "eliminated";
      nodes.push({
        id,
        col: 0,
        cls: `teamnode ${out ? "out" : ""}`,
        body: (
          <>
            <TeamChip id={id} short />
            <span className="s">
              {t.color} · {t.players.length} players
            </span>
          </>
        ),
      });
      links.push([id, mk, out ? "off" : "on"]);
      details[id] = { title: `${t.name} · ${t.color}`, text: teamBlurbs[id] ?? `Captain ${t.captain}.`, bullets: [] };
    }
    const tot = contestTotal(T, mk);
    const outcome = T.matchupOutcomes[mk];
    const sideRow = (side: "home" | "away") => (
      <div className={outcome && outcome.winner !== mu[side] ? "lose" : ""}>
        <TeamChip id={mu[side]} short />
        <b className="num">{fmtPoints(tot[side])}</b>
      </div>
    );
    nodes.push({
      id: mk,
      col: 1,
      cls: "",
      body: (
        <>
          <span className="eyebrow">{day1?.label ?? "Day 1"}</span>
          <h4>{mu.label}</h4>
          <div className="vs">
            {sideRow("home")}
            {sideRow("away")}
          </div>
          {outcome && <span className="s">{outcome.note.replace(/(\d+)\.5/g, "$1½")}</span>}
        </>
      ),
    });
    links.push([mk, "day2", day1Done ? "on" : "tbd"]);
    details[mk] = {
      title: `Day 1 · ${mu.label}`,
      text: day1?.format ?? "",
      bullets: [
        ...scoringSessions(T).map((s) => {
          const v = sessionTotal(T, mk, s);
          return `${sessionShort(s)}: ${shortName(mu.home)} ${fmtPoints(v.home)} – ${shortName(mu.away)} ${fmtPoints(v.away)}`;
        }),
        ...(matchupBullets[mk] ?? []),
      ],
    };
  }

  const alive = T.teams.filter((t) => t.status === "advanced");
  for (const [i, id] of (["day2", "semi", "final"] as const).entries()) {
    const st = stage(id);
    const future = st?.status !== "complete";
    const extra = stageDetails[id];
    const expected = st?.expectedFrom2025;
    let body: ReactNode;
    if (id === "day2")
      body = (
        <>
          <span className="eyebrow">{st?.label}</span>
          <h4>{playersAlive} remain</h4>
          <div className="big num">{playersAlive}</div>
          <span className="s">{alive.map((t) => shortName(t.id)).join(" + ")}</span>
        </>
      );
    else if (id === "semi")
      body = (
        <>
          <span className="eyebrow">{st?.label}</span>
          <h4>Teams of three</h4>
          <span className="s">{expected}</span>
        </>
      );
    else
      body = (
        <>
          <span className="eyebrow">Finale · {epDate(finale)}</span>
          <h4>The final</h4>
          <div className="big num">{money(T.meta.prizeTotalUSD)}</div>
          <span className="s">{T.meta.trophy}</span>
        </>
      );
    nodes.push({
      id,
      col: 2 + i,
      cls: `${future ? "future" : ""} ${id === "final" ? "trophy" : ""}`,
      body: (
        <>
          {body}
          {future && <Pill kind="exp">{id === "day2" ? "Not aired yet" : "Expected"}</Pill>}
        </>
      ),
    });
    if (id !== "final") links.push([id, id === "day2" ? "semi" : "final", future ? "tbd" : "on"]);
    details[id] = {
      title: extra?.title ?? st?.label ?? id,
      text: extra?.text ?? st?.format ?? "",
      bullets: future && expected && !extra ? [`Expected from 2025: ${expected}`] : (extra?.bullets ?? []),
    };
  }
  return { nodes, links, details };
}

function useLinks(ref: React.RefObject<HTMLDivElement | null>, links: [string, string, LinkKind][]) {
  const [paths, setPaths] = useState<{ d: string; k: LinkKind }[]>([]);
  const [box, setBox] = useState({ w: 0, h: 0 });
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const draw = () => {
      if (!el.offsetParent) return;
      const B = el.getBoundingClientRect();
      const get = (id: string) => el.querySelector<HTMLElement>(`[data-node="${id}"]`)?.getBoundingClientRect();
      const out = links.flatMap(([a, b, k]) => {
        const A = get(a);
        const C = get(b);
        if (!A || !C) return [];
        const x1 = A.right - B.left;
        const y1 = A.top + A.height / 2 - B.top;
        const x2 = C.left - B.left;
        const y2 = C.top + C.height / 2 - B.top;
        const mx = (x1 + x2) / 2;
        return [{ d: `M${x1} ${y1} C${mx} ${y1} ${mx} ${y2} ${x2} ${y2}`, k }];
      });
      setBox({ w: B.width, h: B.height });
      setPaths(out);
    };
    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(el);
    document.fonts?.ready.then(draw);
    return () => ro.disconnect();
  }, [ref, links]);
  return { paths, box };
}

function DetailPanel({ d }: { d: Detail }) {
  return (
    <div className="card detail" aria-live="polite">
      <span className="eyebrow">Selected</span>
      <h3>{d.title}</h3>
      {d.text && <p>{d.text}</p>}
      {d.bullets.length > 0 && (
        <ul>
          {d.bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Bracket() {
  const { nodes, links, details } = useMemo(buildBracket, []);
  const [sel, setSel] = useState("FR");
  const ref = useRef<HTMLDivElement>(null);
  const { paths, box } = useLinks(ref, links);

  const nodeBtn = (n: BNode) => (
    <button key={n.id} type="button" data-node={n.id} className={`node ${n.cls}`} aria-pressed={sel === n.id} onClick={() => setSel(n.id)}>
      {n.body}
    </button>
  );
  // A stage's line into the next column is solid if any link out of it is "on".
  const colState = (c: number): LinkKind => {
    const ids = nodes.filter((n) => n.col === c).map((n) => n.id);
    const ks = links.filter((l) => ids.includes(l[0])).map((l) => l[2]);
    return ks.includes("on") ? "on" : ks.includes("tbd") ? "tbd" : "off";
  };

  return (
    <>
      <div className="legend">
        <span>
          <svg viewBox="0 0 30 6">
            <line x1="0" y1="3" x2="30" y2="3" stroke="var(--accent)" strokeWidth="2.5" />
          </svg>
          Advanced
        </span>
        <span>
          <svg viewBox="0 0 30 6">
            <line x1="0" y1="3" x2="30" y2="3" stroke="var(--line-strong)" strokeWidth="2.5" strokeDasharray="5 5" />
          </svg>
          Eliminated
        </span>
        <span>
          <svg viewBox="0 0 30 6">
            <line x1="0" y1="3" x2="30" y2="3" stroke="var(--gold)" strokeWidth="2.5" strokeDasharray="2 6" strokeLinecap="round" />
          </svg>
          Not aired yet
        </span>
      </div>

      {/* Phone: vertical road, detail opens under the stage you tapped */}
      <div className="vroad">
        {COLS.map((label, c) => {
          const colNodes = nodes.filter((n) => n.col === c);
          const selHere = colNodes.some((n) => n.id === sel);
          return (
            <Fragment key={label}>
              <div className={`vstage ${c < COLS.length - 1 ? `rail-${colState(c)}` : "rail-end"}`}>
                <span className="vlabel eyebrow">{label}</span>
                <div className={`vnodes n${colNodes.length}`}>{colNodes.map(nodeBtn)}</div>
              </div>
              {selHere && details[sel] && (
                <div className="vdetail">
                  <DetailPanel d={details[sel]} />
                </div>
              )}
            </Fragment>
          );
        })}
      </div>

      {/* Desktop: horizontal bracket */}
      <div className="card bracket-scroll hbracket">
        <div className="bracket" ref={ref}>
          <svg className="links" aria-hidden="true" viewBox={`0 0 ${box.w || 1} ${box.h || 1}`}>
            {paths.map((p, i) => (
              <path
                key={i}
                className={`${p.k} ${p.k === "on" ? "draw" : ""}`}
                d={p.d}
                ref={(el) => {
                  if (el) el.style.setProperty("--len", String(Math.ceil(el.getTotalLength())));
                }}
              />
            ))}
          </svg>
          {COLS.map((label, c) => (
            <div className="col" key={label}>
              <span className="eyebrow col-label">{label}</span>
              {nodes.filter((n) => n.col === c).map(nodeBtn)}
            </div>
          ))}
        </div>
      </div>
      <div className="hdetail">{details[sel] && <DetailPanel d={details[sel]} />}</div>
    </>
  );
}

function resultOrder(r: string) {
  if (r === "Halved") return [0, 0, 0];
  const up = /^(\d+)UP$/.exec(r);
  if (up) return [1, +up[1], 0];
  const [a, b] = r.split("&").map(Number);
  return [2, a, b];
}

function Decoder() {
  const counts = useMemo(() => {
    const c = new Map<string, number>();
    for (const m of countingMatches(T)) c.set(m.result, (c.get(m.result) ?? 0) + 1);
    return [...c.entries()].sort((x, y) => {
      const a = resultOrder(x[0]);
      const b = resultOrder(y[0]);
      return a[0] - b[0] || a[1] - b[1] || a[2] - b[2];
    });
  }, []);
  const [r, setR] = useState(counts.find(([k]) => k.includes("&"))?.[0] ?? counts[0][0]);
  const played = holesPlayed(r);
  const n = counts.find(([k]) => k === r)?.[1] ?? 0;
  let text: string;
  if (r === "Halved") text = "All square after 9 holes. Each side gets ½ point.";
  else if (/UP$/.test(r)) {
    const u = parseInt(r, 10);
    text = `Went all 9 holes and finished ${u} hole${u > 1 ? "s" : ""} ahead. Worth 1 point.`;
  } else {
    const [a, b] = r.split("&").map(Number);
    text = `${a} holes ahead with only ${b} left to play, so the match ended after hole ${played}. Worth 1 point.`;
  }
  return (
    <div className="card ex decoder">
      <h3>Reading a result</h3>
      <div className="chips" role="group" aria-label="Pick a result">
        {counts.map(([k]) => (
          <button key={k} type="button" aria-pressed={k === r} onClick={() => setR(k)}>
            {k}
          </button>
        ))}
      </div>
      <div className="holes" aria-hidden="true">
        {Array.from({ length: 9 }, (_, i) => (
          <div key={i} className={i < played ? "played" : "skip"}>
            {i + 1}
          </div>
        ))}
      </div>
      <p className="out">
        {text} Happened {n} time{n === 1 ? "" : "s"} on Day 1.
      </p>
      <p className="footnote">
        Each match is worth 1 point and a halve is worth ½. With 16 points on the table, 8½ clinches the contest. A tie at 8–8 goes to a
        sudden-death alternate-shot playoff.
      </p>
    </div>
  );
}

const Hole = ({ children }: { children: ReactNode }) => (
  <>
    <rect className="hole-bg" x="1" y="1" width="318" height="128" rx="10" />
    <path className="fair" d="M20 80 Q120 30 250 60 L280 70 Q200 100 20 100Z" />
    <circle className="green" cx="282" cy="62" r="24" />
    <circle className="svg-ink" cx="282" cy="62" r="3" />
    <rect className="svg-ink" x="20" y="84" width="10" height="10" rx="2" />
    {children}
  </>
);

export default function Format() {
  return (
    <section className="view">
      <SecHead title="The road to $4 million">
        Tap any box for details. Solid green lines are confirmed results. Gold dotted lines are stages still to air, sketched from how the 2025
        event ran.
      </SecHead>
      <Bracket />

      <SecHead title="How the golf works" />
      <div className="explain">
        <div className="card ex">
          <h3>Scramble · Episode 1</h3>
          <svg viewBox="0 0 320 130" role="img" aria-label="Scramble: both players hit, the team picks the best ball, both play from there">
            <Hole>
              <path className="shot" d="M30 88 Q90 40 150 58" />
              <path className="shot" d="M30 88 Q90 70 140 92" />
              <circle className="ball-a" cx="150" cy="58" r="6" />
              <circle className="ball-b" cx="140" cy="92" r="6" />
              <text className="svg-label" x="158" y="54">
                A's drive (picked)
              </text>
              <text className="svg-small" x="150" y="108">
                B's drive
              </text>
              <path className="shot" d="M150 58 Q210 30 268 62" />
              <path className="shot" d="M150 58 Q220 80 274 74" />
              <circle className="ball-a" cx="268" cy="62" r="4" />
              <circle className="ball-b" cx="274" cy="74" r="4" />
              <text className="svg-small" x="168" y="30">
                both hit again from the best spot
              </text>
            </Hole>
          </svg>
          <p>
            Both partners hit every shot. The team picks the better ball and both play the next shot from there. It's the forgiving format, so
            birdies are expected and one great player can carry a pairing.
          </p>
        </div>
        <div className="card ex">
          <h3>Alternate shot · Episode 2</h3>
          <svg viewBox="0 0 320 130" role="img" aria-label="Alternate shot: one ball, partners take turns hitting it">
            <Hole>
              <path className="shot" d="M30 88 Q90 40 150 62" />
              <path className="shot" d="M150 62 Q210 36 262 66" />
              <path className="shot" d="M262 66 L281 63" />
              <circle className="ball-a" cx="30" cy="88" r="6" />
              <text className="svg-label" x="12" y="118">
                A tees off
              </text>
              <circle className="ball-b" cx="150" cy="62" r="6" />
              <text className="svg-label" x="128" y="46">
                B hits 2nd
              </text>
              <circle className="ball-a" cx="262" cy="66" r="6" />
              <text className="svg-label" x="214" y="108">
                A putts
              </text>
            </Hole>
          </svg>
          <p>
            One ball per team. Partners take turns hitting it until it's holed, and one partner tees off on odd holes, the other on even holes.
            A single bad swing leaves your partner in trouble, which is why it decides the cut.
          </p>
        </div>
        <Decoder />
      </div>
      <p className="footnote">
        Stages that haven't aired are based on how the 2025 event ran and will be updated as episodes come out. Sources:{" "}
        <a href={T.meta.sources[0]} target="_blank" rel="noopener">
          YT Golf Stats 2026
        </a>{" "}
        for teams and results, and its{" "}
        <a href={T.meta.sources[1]} target="_blank" rel="noopener">
          2025 page
        </a>{" "}
        for how later rounds ran last year.
      </p>
    </section>
  );
}
