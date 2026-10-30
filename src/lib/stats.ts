import type { Match, Side, TeamId, Tournament } from "./types";
import { countingMatches, holesPlayed, markFor, matchPoints, sessionCounts } from "./scoring";

/** Holes the winner finished ahead by: "4&3" → 4, "2UP" → 2, "Halved" → 0. */
export function marginOf(result: string): number {
  const m = /^(\d+)(?:&\d+|UP)$/.exec(result);
  return m ? Number(m[1]) : 0;
}

/** Margin from one side's point of view: positive if that side won. */
export function sideMargin(m: Match, side: Side): number {
  if (m.winner === "halved") return 0;
  const mg = marginOf(m.result);
  return m.winner === side ? mg : -mg;
}

export interface WormStep {
  match: Match;
  home: number;
  away: number;
}

/** Running contest score after each counting match, in played order. */
export function worm(t: Tournament, matchup: string): WormStep[] {
  let home = 0;
  let away = 0;
  return countingMatches(t)
    .filter((m) => m.matchup === matchup)
    .map((m) => {
      const p = matchPoints(m.winner);
      home += p.home;
      away += p.away;
      return { match: m, home, away };
    });
}

export interface TeamSessionLine {
  points: number;
  wins: number;
  halves: number;
  losses: number;
  /** Sum of holes-up over all matches (wins minus losses). */
  net: number;
}

/** Per-team, per-session totals across counting matches. */
export function teamSessionLines(t: Tournament): Map<TeamId, Map<string, TeamSessionLine>> {
  const out = new Map<TeamId, Map<string, TeamSessionLine>>();
  for (const team of t.teams) out.set(team.id, new Map());
  for (const m of countingMatches(t)) {
    for (const side of ["home", "away"] as const) {
      const bySession = out.get(m[side].team)!;
      const line = bySession.get(m.session) ?? { points: 0, wins: 0, halves: 0, losses: 0, net: 0 };
      const mark = markFor(m.winner, side);
      line.points += matchPoints(m.winner)[side];
      if (mark === "W") line.wins++;
      else if (mark === "H") line.halves++;
      else line.losses++;
      line.net += sideMargin(m, side);
      bySession.set(m.session, line);
    }
  }
  return out;
}

export interface PlayerLine {
  name: string;
  team: TeamId;
  played: number;
  points: number;
  net: number;
  /** Holes the player was on the course for in counting matches. */
  holes: number;
}

/** One line per player who appeared in a counting match. */
export function playerLines(t: Tournament): PlayerLine[] {
  const map = new Map<string, PlayerLine>();
  for (const m of countingMatches(t)) {
    const holes = holesPlayed(m.result, t.sessions[m.session]?.holes ?? 9);
    for (const side of ["home", "away"] as const) {
      for (const name of m[side].players) {
        const l = map.get(name) ?? { name, team: m[side].team, played: 0, points: 0, net: 0, holes: 0 };
        l.played++;
        l.points += matchPoints(m.winner)[side];
        l.net += sideMargin(m, side);
        l.holes += holes;
        map.set(name, l);
      }
    }
  }
  return [...map.values()];
}

export interface PairLine {
  players: [string, string];
  team: TeamId;
  match: Match;
  side: Side;
  margin: number;
}

/** Every pairing that played, with its margin. */
export function pairLines(t: Tournament): PairLine[] {
  return countingMatches(t).flatMap((m) =>
    (["home", "away"] as const).map((side) => ({ players: m[side].players, team: m[side].team, match: m, side, margin: sideMargin(m, side) })),
  );
}

/** "+3.9" → -3.9 (better than scratch), "7.2" → 7.2, null → null. */
export function handicapValue(h: string | null): number | null {
  if (h == null) return null;
  const v = parseFloat(h.replace("+", ""));
  if (Number.isNaN(v)) return null;
  return h.trim().startsWith("+") ? -v : v;
}

export interface HoleTally {
  /** Matches still being played when this hole started. */
  live: number;
  /** Matches that ended on this hole (closed out, or went the distance). */
  decided: number;
}

/**
 * How many matches of a nine-hole session reached each hole, and how many finished there.
 * Index 0 is the session's first hole.
 */
export function holeTallies(t: Tournament, session: string): HoleTally[] {
  const holes = t.sessions[session]?.holes ?? 9;
  const out: HoleTally[] = Array.from({ length: holes }, () => ({ live: 0, decided: 0 }));
  if (!sessionCounts(t, session)) return out;
  for (const m of t.matches.filter((x) => x.session === session)) {
    const played = holesPlayed(m.result, holes);
    for (let i = 0; i < played; i++) out[i].live++;
    out[played - 1].decided++;
  }
  return out;
}
