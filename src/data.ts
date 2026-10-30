import raw from "../data/tournament.json";
import type { Episode, Team, TeamId, Tournament } from "./lib/types";
import { contestTotal, fmtPoints, playerRecords } from "./lib/scoring";

export const T = raw as unknown as Tournament;

export const TEAM_ORDER: TeamId[] = ["ruffels", "bryan", "finch", "dalke"];
export const teams: Record<string, Team> = Object.fromEntries(T.teams.map((t) => [t.id, t]));
export const records = playerRecords(T);
export const teamOfPlayer = new Map<string, TeamId>();
for (const t of T.teams) for (const p of t.players) teamOfPlayer.set(p.name, t.id);

export const shortName = (id: string) => teams[id]?.name.replace(/^Team /, "") ?? id;
export const playersAlive = T.teams.filter((t) => t.status === "advanced").reduce((n, t) => n + t.players.length, 0);

/** Short label for a session, e.g. "Ep 1 · Scramble". */
export function sessionShort(key: string): string {
  return T.sessions[key]?.label.replace("Episode ", "Ep ") ?? key;
}

/** Release time of an episode. 1pm ET is 17:00 UTC (EDT) or 18:00 UTC (EST); close enough to use -04:00/-05:00 by month. */
export function releaseTime(ep: Episode): Date {
  const [y, m, d] = ep.date.split("-").map(Number);
  // US DST ends first Sunday of November.
  const firstSunNov = 1 + ((7 - new Date(Date.UTC(y, 10, 1)).getUTCDay()) % 7);
  const isDST = m > 3 && (m < 11 || (m === 11 && d < firstSunNov));
  const [hh, mm] = ep.timeET.split(":").map(Number);
  return new Date(Date.UTC(y, m - 1, d, hh + (isDST ? 4 : 5), mm));
}

export type EpisodeState = "released" | "aired" | "next" | "upcoming";

/** released = results in the app; aired = out but not entered yet; next = first one still to come. */
export function episodeStates(now = new Date()): Map<number, EpisodeState> {
  const out = new Map<number, EpisodeState>();
  let nextFound = false;
  for (const ep of T.episodes) {
    if (ep.status === "released") out.set(ep.n, "released");
    else if (releaseTime(ep) <= now) out.set(ep.n, "aired");
    else if (!nextFound) {
      out.set(ep.n, "next");
      nextFound = true;
    } else out.set(ep.n, "upcoming");
  }
  return out;
}

export function nextEpisode(now = new Date()): Episode | undefined {
  const states = episodeStates(now);
  return T.episodes.find((e) => states.get(e.n) === "next");
}

export function epDate(ep: Episode, opts: Intl.DateTimeFormatOptions = { weekday: "short", month: "short", day: "numeric" }) {
  const [y, m, d] = ep.date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12)).toLocaleDateString("en-US", { ...opts, timeZone: "UTC" });
}

export function epName(ep: Episode) {
  return ep.n === T.episodes.length ? "Finale" : `Ep ${ep.n}`;
}

/** One-line result for a team's Day 1 contest, built from the data. */
export function teamOutcomeLine(id: string): string {
  for (const [key, mu] of Object.entries(T.matchups)) {
    if (mu.home !== id && mu.away !== id) continue;
    const opp = mu.home === id ? mu.away : mu.home;
    const outcome = T.matchupOutcomes[key];
    const tot = contestTotal(T, key);
    const mine = mu.home === id ? tot.home : tot.away;
    const theirs = mu.home === id ? tot.away : tot.home;
    const score = `${fmtPoints(Math.max(mine, theirs))}–${fmtPoints(Math.min(mine, theirs))}`;
    const won = outcome?.winner === id;
    if (outcome?.decidedBy === "playoff")
      return won
        ? `Beat ${teams[opp].name} in a sudden-death playoff after a ${score} tie`
        : `Lost to ${teams[opp].name} in a sudden-death playoff after a ${score} tie`;
    return won ? `Beat ${teams[opp].name} ${score}` : `Lost to ${teams[opp].name} ${score}`;
  }
  return "";
}

export function money(usd: number): string {
  if (usd >= 1_000_000) return `$${+(usd / 1_000_000).toFixed(1)}M`;
  if (usd >= 1_000) return `$${Math.round(usd / 1_000)}K`;
  return `$${usd}`;
}
