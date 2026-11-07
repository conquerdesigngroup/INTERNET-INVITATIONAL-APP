import type { Match, RecordMark, Tournament, Winner } from "./types";

export interface Score {
  home: number;
  away: number;
}

/** True when a session's matches count toward contest points (playoffs don't). */
export function sessionCounts(t: Tournament, session: string): boolean {
  return t.sessions[session]?.countsTowardPoints !== false;
}

/** Matches that score: in a counting session and actually decided (not called in unfinished). */
export function countingMatches(t: Tournament): Match[] {
  return t.matches.filter((m) => sessionCounts(t, m.session) && m.winner !== "unfinished");
}

/** Point-scoring sessions a matchup actually played, in display order. */
export function matchupSessions(t: Tournament, matchup: string): string[] {
  return scoringSessions(t).filter((s) => t.matches.some((m) => m.matchup === matchup && m.session === s));
}

/** Points available in a matchup: one per scheduled match, unfinished ones included. */
export function matchupPointsAvailable(t: Tournament, matchup: string): number {
  return t.matches.filter((m) => m.matchup === matchup && sessionCounts(t, m.session)).length;
}

/** Short name for a session format, e.g. "Alt shot". */
export function formatShort(format: string | undefined): string {
  if (format === "scramble") return "Scramble";
  if (format === "alternate_shot") return "Alt shot";
  if (format === "singles") return "Singles";
  return format ?? "";
}

/** Points a single match is worth to each side: win = 1, halved = ½ each. */
export function matchPoints(winner: Winner): Score {
  if (winner === "home") return { home: 1, away: 0 };
  if (winner === "away") return { home: 0, away: 1 };
  if (winner === "unfinished") return { home: 0, away: 0 };
  return { home: 0.5, away: 0.5 };
}

function sum(matches: Match[]): Score {
  return matches.reduce<Score>(
    (acc, m) => {
      const p = matchPoints(m.winner);
      return { home: acc.home + p.home, away: acc.away + p.away };
    },
    { home: 0, away: 0 },
  );
}

/** Points for one matchup in one session. Raw tally, even for a playoff session. */
export function sessionTotal(t: Tournament, matchup: string, session: string): Score {
  return sum(t.matches.filter((m) => m.winner !== "unfinished").filter((m) => m.matchup === matchup && m.session === session));
}

/** Contest total for a matchup, excluding sessions that don't count. */
export function contestTotal(t: Tournament, matchup: string): Score {
  return sum(countingMatches(t).filter((m) => m.matchup === matchup));
}

/** Every session key in play order (by episode; JS would otherwise put "3" before "P"). */
export function sessionOrder(t: Tournament): string[] {
  return Object.keys(t.sessions)
    .map((k, i) => ({ k, i }))
    .sort((a, b) => t.sessions[a.k].episode - t.sessions[b.k].episode || a.i - b.i)
    .map((x) => x.k);
}

/** Point-scoring session keys in display order. */
export function scoringSessions(t: Tournament): string[] {
  return sessionOrder(t).filter((s) => sessionCounts(t, s));
}

export interface PlayerRecord {
  marks: RecordMark[];
  points: number;
  wins: number;
}

export function markFor(winner: Winner, side: "home" | "away"): RecordMark {
  if (winner === "halved") return "H";
  return winner === side ? "W" : "L";
}

/** Ordered W/H/L record for every player, across counting matches only. */
export function playerRecords(t: Tournament): Map<string, PlayerRecord> {
  const recs = new Map<string, PlayerRecord>();
  for (const team of t.teams) for (const p of team.players) recs.set(p.name, { marks: [], points: 0, wins: 0 });
  for (const m of countingMatches(t)) {
    for (const side of ["home", "away"] as const) {
      const mark = markFor(m.winner, side);
      for (const name of m[side].players) {
        let r = recs.get(name);
        if (!r) recs.set(name, (r = { marks: [], points: 0, wins: 0 }));
        r.marks.push(mark);
        r.points += mark === "W" ? 1 : mark === "H" ? 0.5 : 0;
        if (mark === "W") r.wins++;
      }
    }
  }
  return recs;
}

/** Team totals from counting matches: points and matches won. */
export function teamTotals(t: Tournament, teamId: string): { points: number; wins: number } {
  let points = 0;
  let wins = 0;
  for (const m of countingMatches(t)) {
    for (const side of ["home", "away"] as const) {
      if (m[side].team !== teamId) continue;
      points += matchPoints(m.winner)[side];
      if (m.winner === side) wins++;
    }
  }
  return { points, wins };
}

/** 10.5 → "10½", 0.5 → "½", 8 → "8". */
export function fmtPoints(n: number): string {
  const whole = Math.floor(n);
  const half = n - whole >= 0.5;
  if (!half) return String(whole);
  return whole ? `${whole}½` : "½";
}

/** Holes actually played for a 9-hole match result like "4&3" (→ 6). */
export function holesPlayed(result: string, holes = 9): number {
  const m = /^(\d+)&(\d+)$/.exec(result);
  return m ? holes - Number(m[2]) : holes;
}
