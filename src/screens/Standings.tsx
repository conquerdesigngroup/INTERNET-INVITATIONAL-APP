import { T, TEAM_ORDER, epDate, epName, episodeStates, money, sessionShort, shortName, teams } from "../data";
import { boardStories, standingsIntro } from "../content";
import { contestTotal, fmtPoints, scoringSessions, sessionTotal } from "../lib/scoring";
import { Pill, PlayerLink, SecHead, TeamChip } from "../components";

function Board({ mk }: { mk: string }) {
  const mu = T.matchups[mk];
  const outcome = T.matchupOutcomes[mk];
  const tot = contestTotal(T, mk);
  const sessions = scoringSessions(T);
  const winner = outcome?.winner;
  const order = winner === mu.away ? (["away", "home"] as const) : (["home", "away"] as const);
  const totalPts = tot.home + tot.away;

  return (
    <article className="card board">
      <div className="board-top">
        <span className="eyebrow">{mu.label}</span>
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

function Facts() {
  const day1 = T.stages.find((s) => s.id === "day1");
  const [ace, ctp] = T.meta.bonuses;
  const facts = [
    { b: money(T.meta.prizeTotalUSD), s: `Total prize · about ${money(T.meta.prizePerWinnerUSD)} per player on the winning team` },
    day1?.players && day1.playersAfter ? { b: `${day1.players} → ${day1.playersAfter}`, s: "Players after Day 1" } : null,
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
      {TEAM_ORDER.map((id) => {
        const t = teams[id];
        const alive = t.status === "advanced";
        const names = (
          <div className="names">
            {t.players.map((p) => (
              <PlayerLink key={p.name} name={p.name} className={`name ${p.isCaptain ? "cap" : ""}`}>
                {p.isCaptain && <span className="star" aria-label="Captain">★ </span>}
                {p.name}
              </PlayerLink>
            ))}
          </div>
        );
        return alive ? (
          <div key={id} className="card surv">
            <div className="board-top">
              <TeamChip id={id} />
              <Pill kind="adv">{t.players.length} alive</Pill>
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
