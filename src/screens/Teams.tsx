import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { TEAM_ORDER, T, records, shortName, teamOutcomeLine, teams } from "../data";
import { fmtPoints, teamTotals } from "../lib/scoring";
import { Pill, PlayerLink, RecordChips, SecHead, TeamDot } from "../components";

const KEY = "ii26-team";

function storedTeam(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export default function Teams() {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const cur = teamId && teams[teamId] ? teamId : null;

  useEffect(() => {
    if (!cur) {
      const s = storedTeam();
      navigate(`/teams/${s && teams[s] ? s : TEAM_ORDER[0]}`, { replace: true });
    } else {
      try {
        localStorage.setItem(KEY, cur);
      } catch {
        /* storage unavailable */
      }
    }
  }, [cur, navigate]);

  if (!cur) return null;
  const t = teams[cur];
  const alive = t.status === "advanced";
  const tot = teamTotals(T, cur);

  return (
    <section className="view">
      <SecHead title="The four teams">
        Captains were voted in, then ran a snake draft. A "+" handicap means better than scratch.
      </SecHead>

      <div className="seg" role="group" aria-label="Choose a team">
        {TEAM_ORDER.map((id) => (
          <button key={id} type="button" aria-pressed={id === cur} onClick={() => navigate(`/teams/${id}`, { replace: true })}>
            <TeamDot id={id} />
            {shortName(id)}
          </button>
        ))}
      </div>

      <div className={`card team-card t-${cur}`}>
        <div className="team-head">
          <div className="team-id">
            <span className="tchip">
              <TeamDot id={cur} />
              <span className="eyebrow">
                {t.color} · Capt. {t.captain}
              </span>
            </span>
            <h3>{t.name}</h3>
            <span className="sub">{teamOutcomeLine(cur)}</span>
          </div>
          <div className="team-stats">
            <div>
              <b className="num">{fmtPoints(tot.points)}</b>
              <span>Day 1 pts</span>
            </div>
            <div>
              <b className="num">{tot.wins}</b>
              <span>Matches won</span>
            </div>
            <div className="team-status">{alive ? <Pill kind="adv">Advanced</Pill> : <Pill kind="out">Eliminated</Pill>}</div>
          </div>
        </div>

        <div className="roster" aria-label={`${t.name} roster`}>
          <div className="roster-row roster-headrow">
            <span>Player</span>
            <span className="c-hcp">Hcp</span>
            <span>Record</span>
            <span className="r">Pts</span>
          </div>
          {t.players.map((p) => {
            const r = records.get(p.name);
            return (
              <PlayerLink key={p.name} name={p.name} className="roster-row">
                <span className="c-name">
                  <b>
                    {p.isCaptain && (
                      <span className="star" title="Captain" aria-label="Captain">
                        ★{" "}
                      </span>
                    )}
                    {p.name}
                  </b>
                  <small className="hcp-sm num">{p.handicap ?? "n/a"}</small>
                </span>
                <span className="c-hcp num">
                  {p.handicap ?? <span className="muted">n/a</span>}
                </span>
                <span>
                  <RecordChips marks={r?.marks ?? []} />
                </span>
                <span className="r num pts-cell">
                  {fmtPoints(r?.points ?? 0)}
                </span>
                <svg className="row-chev" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" />
                </svg>
              </PlayerLink>
            );
          })}
        </div>
      </div>
      <p className="hint">
        Record shows each player's Day 1 matches in order (W win, H halved, L loss). Win = 1 pt, halve = ½. Tap a player to see their
        matches.
      </p>
    </section>
  );
}
