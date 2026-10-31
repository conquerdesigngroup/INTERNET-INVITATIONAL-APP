import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { T, records, shortName, teamOfPlayer } from "../data";
import { fmtPoints, sessionCounts, sessionTotal } from "../lib/scoring";
import type { Match } from "../lib/types";
import { Avatar, Chips, RecordChips, SecHead, TeamDot, playerHref } from "../components";

function MatchCard({ m, q }: { m: Match; q: string }) {
  const mu = T.matchups[m.matchup];
  const winTeam = m.winner === "home" ? mu.home : m.winner === "away" ? mu.away : null;
  const pl = (n: string) => (
    <Link key={n} to={playerHref(n)} className={`pl ${q && n.toLowerCase().includes(q) ? "hit" : ""}`}>
      <Avatar name={n} size={22} />
      {n}
    </Link>
  );
  const side = (s: "home" | "away") => (
    <div className={`pair ${s} ${m.winner !== "halved" && m.winner !== s ? "lost" : ""} ${m.winner === s ? "won" : ""}`}>
      <span className="pair-team">
        <TeamDot id={m[s].team} />
        {shortName(m[s].team)}
      </span>
      <span className="pair-names">{m[s].players.map(pl)}</span>
    </div>
  );
  return (
    <article className="card match">
      {side("home")}
      <div className="res">
        <span className={`score ${winTeam ?? "half"}`}>{m.result}</span>
        <small>{winTeam ? `${shortName(winTeam)} win` : "Split ½–½"}</small>
      </div>
      {side("away")}
      {m.note && <p className="note">{m.note}</p>}
    </article>
  );
}

export default function Matches() {
  const [params, setParams] = useSearchParams();
  const sess = params.get("session") ?? "all";
  const mk = params.get("matchup") ?? "all";
  const player = params.get("player") ?? "";
  const q = player.trim().toLowerCase();

  const set = (key: string, v: string) => {
    const next = new URLSearchParams(params);
    if (!v || v === "all") next.delete(key);
    else next.set(key, v);
    setParams(next, { replace: true });
  };

  const groups = useMemo(() => {
    const list = T.matches.filter(
      (m) =>
        (sess === "all" || m.session === sess) &&
        (mk === "all" || m.matchup === mk) &&
        (!q || [...m.home.players, ...m.away.players].some((n) => n.toLowerCase().includes(q))),
    );
    const out: { s: string; mk: string; ms: Match[] }[] = [];
    for (const s of Object.keys(T.sessions))
      for (const k of Object.keys(T.matchups)) {
        const ms = list.filter((m) => m.session === s && m.matchup === k);
        if (ms.length) out.push({ s, mk: k, ms });
      }
    return out;
  }, [sess, mk, q]);

  // Exact player match: show a small profile strip.
  const exact = [...teamOfPlayer.keys()].find((n) => n.toLowerCase() === q);
  const rec = exact ? records.get(exact) : undefined;
  const filtered = sess !== "all" || mk !== "all" || !!q;

  return (
    <section className="view">
      <SecHead title="Every match">Nine-hole 2v2 match play. The score pill is colored by the winning team.</SecHead>

      <div className="filters">
        <div className="search">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            value={player}
            onChange={(e) => set("player", e.target.value)}
            placeholder="Search a player, e.g. Big John"
            aria-label="Search players"
            list="player-names"
            enterKeyHint="search"
          />
          <datalist id="player-names">
            {[...teamOfPlayer.keys()].map((n) => (
              <option key={n} value={n} />
            ))}
          </datalist>
        </div>
        <Chips
          label="Session"
          value={sess}
          onChange={(v) => set("session", v)}
          options={[["all", "All"], ...Object.entries(T.sessions).map(([k, s]) => [k, s.label.replace(/^Episode (\d+) · /, "Ep $1 · ").replace("Sudden-death playoff", "Playoff")] as [string, string])]}
        />
        <Chips
          label="Matchup"
          value={mk}
          onChange={(v) => set("matchup", v)}
          options={[["all", "Both matchups"], ...Object.entries(T.matchups).map(([k, m]) => [k, m.label] as [string, string])]}
        />
        {filtered && (
          <button type="button" className="clear" onClick={() => setParams({}, { replace: true })}>
            Reset filters
          </button>
        )}
      </div>

      {exact && rec && (
        <div className="card player-strip">
          <div className="player-strip-id">
            <Avatar name={exact} size={52} />
            <div>
              <span className="eyebrow">
                <TeamDot id={teamOfPlayer.get(exact)!} /> {shortName(teamOfPlayer.get(exact)!)}
              </span>
              <h3>{exact}</h3>
            </div>
          </div>
          <div className="player-strip-stats">
            <RecordChips marks={rec.marks} />
            <span className="num">{fmtPoints(rec.points)} pts</span>
          </div>
        </div>
      )}

      <div className="mlist">
        {groups.length === 0 && <div className="card empty">No matches for those filters. Try a shorter name or reset the filters.</div>}
        {groups.map((g) => {
          const mu = T.matchups[g.mk];
          const tally = sessionCounts(T, g.s) ? sessionTotal(T, g.mk, g.s) : null;
          return (
            <div className="mgroup" key={g.s + g.mk}>
              <h3>
                <span>{T.sessions[g.s].label}</span>
                <span className="mgroup-sub">
                  <span className="mgroup-mu">
                    <TeamDot id={mu.home} />
                    <TeamDot id={mu.away} /> {mu.label}
                  </span>
                  {tally && (
                    <span className="num mgroup-score">
                      {shortName(mu.home)} {fmtPoints(tally.home)} – {fmtPoints(tally.away)} {shortName(mu.away)}
                    </span>
                  )}
                  {!tally && <span className="mgroup-score">Doesn't count toward points</span>}
                </span>
              </h3>
              {g.ms.map((m) => (
                <MatchCard key={m.id} m={m} q={q} />
              ))}
            </div>
          );
        })}
      </div>
    </section>
  );
}
