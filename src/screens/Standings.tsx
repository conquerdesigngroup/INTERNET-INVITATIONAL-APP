import { T, TEAM_ORDER, alivePlayers, ep5Exit, epDate, epName, episodeStates, finalTeams, fmtToPar, money, sessionShort, shortName, teams } from "../data";
import { boardStories, standingsIntro } from "../content";
import { contestTotal, fmtPoints, matchupSessions, sessionTotal } from "../lib/scoring";
import { Avatar, Pill, PlayerLink, SecHead, TeamChip } from "../components";

function Board({ mk }: { mk: string }) {
  const mu = T.matchups[mk];
  const outcome = T.matchupOutcomes[mk];
  const tot = contestTotal(T, mk);
  const sessions = matchupSessions(T, mk);
  const winner = outcome?.winner;
  const order = winner === mu.away ? (["away", "home"] as const) : (["home", "away"] as const);
  const totalPts = tot.home + tot.away;

  return (
    <article className="card board">
      <div className="board-top">
        <span className="eyebrow">
          {T.stages.find((st) => st.id === mu.stage)?.label.split(" · ")[0] ?? ""} · {mu.label}
        </span>
        {outcome?.decidedBy === "playoff" ? <Pill kind="exp">Won in playoff</Pill> : winner ? <Pill kind="adv">Clinched</Pill> : null}
      </div>
      {order.map((side) => {
        const id = mu[side];
        const won = winner ? id === winner : undefined;
        return (
          <div key={side} className={`score-row ${won === true ? "win" : won === false ? "lose" : ""}`}>
            <div className="who">
              <TeamChip id={id} />
              <small>
                Capt. {teams[id].captain} · {teams[id].color}
              </small>
            </div>
            <div className="score-right">
              {won !== undefined && (won ? <Pill kind="adv">Advanced</Pill> : <Pill kind="out">Out</Pill>)}
              <div className="pts num">{fmtPoints(tot[side])}</div>
            </div>
          </div>
        );
      })}
      <div
        className="split"
        role="img"
        aria-label={`${teams[mu.home].name} ${fmtPoints(tot.home)}, ${teams[mu.away].name} ${fmtPoints(tot.away)} of ${totalPts}`}
      >
        <span className={mu.home} style={{ flex: tot.home }} />
        <span className={mu.away} style={{ flex: tot.away }} />
      </div>
      <table className="sess-table">
        <thead>
          <tr>
            <th>Session</th>
            <th>{shortName(mu.home)}</th>
            <th>{shortName(mu.away)}</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((s) => {
            const v = sessionTotal(T, mk, s);
            return (
              <tr key={s}>
                <td>{sessionShort(s)}</td>
                <td className="num">{fmtPoints(v.home)}</td>
                <td className="num">{fmtPoints(v.away)}</td>
              </tr>
            );
          })}
          <tr>
            <td>Total</td>
            <td className="num">{fmtPoints(tot.home)}</td>
            <td className="num">{fmtPoints(tot.away)}</td>
          </tr>
        </tbody>
      </table>
      {boardStories[mk] && <p className="story">{boardStories[mk]}</p>}
    </article>
  );
}

function SemiBoard() {
  const e = T.episode5;
  if (!e) return null;
  const rows = [...e.semifinal.teams].sort((a, b) => a.toPar - b.toPar);
  return (
    <article className="card board">
      <div className="board-top">
        <span className="eyebrow">
          {T.stages.find((st) => st.id === "semi")?.label ?? "Semifinal"} · {e.course}
        </span>
        <Pill kind="adv">Final set</Pill>
      </div>
      {rows.map((t, i) => {
        const won = t.result === "advanced";
        return (
          <div key={t.id} className={`score-row ${won ? "win" : "lose"}`}>
            <div className="who">
              <span className="tchip">
                <span className={`tdot ${t.id}`} aria-hidden="true" />
                {t.name}
              </span>
              <small>
                {i + 1}. {t.players.join(", ")}
              </small>
            </div>
            <div className="score-right">
              {won ? <Pill kind="adv">To the final</Pill> : <Pill kind="out">Out</Pill>}
              <div className="pts num">{fmtToPar(t.toPar)}</div>
            </div>
          </div>
        );
      })}
      <p className="story">
        {e.semifinal.holes} holes of alternate shot, stroke play, teams of three; the top two went through. Before it, a hole-by-hole knockout
        between four teams of four sent Team Horvat home.
      </p>
    </article>
  );
}

function KnockoutBoard() {
  const e = T.episode5;
  if (!e) return null;
  const k = e.knockout;
  return (
    <article className="card board">
      <div className="board-top">
        <span className="eyebrow">Episode 5 · Knockout</span>
        <Pill kind="out">4 out</Pill>
      </div>
      {k.teams.map((t) => (
        <div key={t.captain} className={`score-row ${t.result === "out" ? "lose" : ""}`}>
          <div className="who">
            <b>Team {t.captain}</b>
            <small>{t.players.join(", ")}</small>
            <small>{t.note}</small>
          </div>
          <div className="score-right">{t.result === "out" ? <Pill kind="out">Out</Pill> : <Pill kind="adv">Safe</Pill>}</div>
        </div>
      ))}
      <p className="story">{k.format}</p>
      {k.rosterNote && <p className="footnote">{k.rosterNote}</p>}
    </article>
  );
}

function Facts() {
  const cuts = T.stages.filter((s) => s.status === "complete" && s.players && s.playersAfter);
  const [ace, ctp] = T.meta.bonuses;
  const facts = [
    { b: money(T.meta.prizeTotalUSD), s: `Total prize · about ${money(T.meta.prizePerWinnerUSD)} per player on the winning team` },
    ...cuts.map((st) => ({ b: `${st.players} → ${st.playersAfter}`, s: `Players after ${st.label.split(" · ")[0]}` })),
    ace ? { b: money(ace.amountUSD), s: ace.detail } : null,
    ctp ? { b: money(ctp.amountUSD), s: ctp.detail.split(";")[0] + " for the captains' closest-to-the-pin" } : null,
    { b: "0", s: "Handicaps. Everyone plays the same tees" },
  ].filter(Boolean) as { b: string; s: string }[];
  return (
    <div className="facts">
      {facts.map((f) => (
        <div className="fact" key={f.b}>
          <b>{f.b}</b>
          <span>{f.s}</span>
        </div>
      ))}
    </div>
  );
}

function Survivors() {
  return (
    <div className="survivors">
      {finalTeams.map((ft) => (
        <div key={ft.id} className="card surv">
          <div className="board-top">
            <span className="tchip">
              <span className={`tdot ${ft.id}`} aria-hidden="true" />
              {ft.name}
            </span>
            <Pill kind="adv">In the final</Pill>
          </div>
          <div className="names">
            {ft.players.map((n) => (
              <PlayerLink key={n} name={n} className="name">
                <Avatar name={n} size={20} />
                <span>{n}</span>
              </PlayerLink>
            ))}
          </div>
        </div>
      ))}
      {TEAM_ORDER.map((id) => {
        const t = teams[id];
        const left = t.players.filter((p) => alivePlayers.has(p.name)).length;
        const alive = t.status === "advanced" && left > 0;
        const names = (
          <div className="names">
            {t.players.map((p) => {
              const exit = t.status === "advanced" ? ep5Exit(p.name) : null;
              return (
                <PlayerLink key={p.name} name={p.name} className={`name ${p.isCaptain ? "cap" : ""} ${exit ? "gone" : ""}`}>
                  <Avatar name={p.name} size={20} />
                  <span>
                    {p.isCaptain && <span className="star" aria-label="Captain">★ </span>}
                    {p.name}
                    {exit && <small className="muted"> · out in {exit === "knockout" ? "knockout" : "semi"}</small>}
                  </span>
                </PlayerLink>
              );
            })}
          </div>
        );
        if (alive && finalTeams.length)
          return (
            <details key={id} className="card surv">
              <summary className="board-top">
                <TeamChip id={id} />
                <span className="sum-right">
                  <Pill kind="adv">{left} of {t.players.length} left</Pill>
                  <svg className="chev" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </span>
              </summary>
              {names}
            </details>
          );
        return alive ? (
          <div key={id} className="card surv">
            <div className="board-top">
              <TeamChip id={id} />
              <Pill kind="adv">{left} alive</Pill>
            </div>
            {names}
          </div>
        ) : (
          <details key={id} className="card surv out">
            <summary className="board-top">
              <TeamChip id={id} />
              <span className="sum-right">
                <Pill kind="out">Out</Pill>
                <svg className="chev" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" />
                </svg>
              </span>
            </summary>
            {names}
          </details>
        );
      })}
    </div>
  );
}

function Schedule() {
  const states = episodeStates();
  const tag = { released: "Out now", aired: "Aired · results soon", next: "Up next", upcoming: "Upcoming" };
  return (
    <div className="sched hscroll" role="list">
      {T.episodes.map((ep) => {
        const st = states.get(ep.n)!;
        return (
          <div key={ep.n} role="listitem" className={`ep ${st}`}>
            <span className="tag">{tag[st]}</span>
            <span className="n">{epName(ep)}</span>
            <span className="d">
              {epDate(ep)}
              {ep.summary ? ` · ${ep.summary}` : ""}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function Standings() {
  return (
    <section className="view">
      <SecHead title={standingsIntro.title}>{standingsIntro.text}</SecHead>
      <div className="boards">
        <SemiBoard />
        <KnockoutBoard />
        {Object.keys(T.matchups).map((mk) => (
          <Board key={mk} mk={mk} />
        ))}
      </div>

      <Facts />

      <SecHead title="Who's still alive">Tap a name to see every match they've played.</SecHead>
      <Survivors />

      <SecHead title="Episode schedule">New episodes drop Mondays and Thursdays at 1pm ET on YouTube.</SecHead>
      <Schedule />

      <SecHead title="Moments that decided it" />
      <div className="moments hscroll">
        {T.moments.map((m) => (
          <div className="card moment" key={m.title}>
            <span className="k">{m.title}</span>
            <p>{m.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
