import raw from "../data/tournament.json";
import type { Episode, Team, TeamId, Tournament } from "./lib/types";
import { contestTotal, fmtPoints, playerRecords } from "./lib/scoring";

export const T = raw as unknown as Tournament;

export const TEAM_ORDER: TeamId[] = ["ruffels", "bryan", "finch", "dalke"];
export const teams: Record<string, Team> = Object.fromEntries(T.teams.map((t) => [t.id, t]));
export const records = playerRecords(T);
export const teamOfPlayer = new Map<string, TeamId>();
/** Handicap index as published, e.g. "+7.2" (better than scratch) or "12.6"; null when no index is public. */
export const handicapOf = new Map<string, string | null>();
for (const t of T.teams)
  for (const p of t.players) {
    teamOfPlayer.set(p.name, t.id);
    handicapOf.set(p.name, p.handicap);
  }

export const shortName = (id: string) => teams[id]?.name.replace(/^Team /, "") ?? id;
/** Teams of three still alive after the Episode 5 semifinal; empty before it aired. */
export const finalTeams = T.episode5?.semifinal.teams.filter((t) => t.result === "advanced") ?? [];
/** Names still in the tournament. Before Episode 5 this is everyone on an advanced Day 1 team. */
export const alivePlayers = new Set<string>(
  finalTeams.length
    ? finalTeams.flatMap((t) => t.players)
    : T.teams.filter((t) => t.status === "advanced").flatMap((t) => t.players.map((p) => p.name)),
);
export const playersAlive = alivePlayers.size;

/** Where a player went out in Episode 5, if they did. */
export function ep5Exit(name: string): "knockout" | "semifinal" | null {
  const e = T.episode5;
  if (!e || alivePlayers.has(name)) return null;
  if (e.knockout.teams.some((t) => t.result === "out" && t.players.includes(name))) return "knockout";
  if (e.semifinal.teams.some((t) => t.result === "eliminated" && t.players.includes(name))) return "semifinal";
  return null;
}

/** Stroke-play score to par: "E", "+2", "-1". */
export const fmtToPar = (n: number) => (n === 0 ? "E" : n > 0 ? `+${n}` : `−${-n}`);

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

/** Result line for each contest a team played, latest first, built from the data. */
export function teamOutcomeLine(id: string): string {
  const lines: string[] = [];
  for (const [key, mu] of Object.entries(T.matchups)) {
    if (mu.home !== id && mu.away !== id) continue;
    const day = T.stages.find((s) => s.id === mu.stage)?.label.split(" · ")[0];
    const opp = mu.home === id ? mu.away : mu.home;
    const outcome = T.matchupOutcomes[key];
    const tot = contestTotal(T, key);
    const mine = mu.home === id ? tot.home : tot.away;
    const theirs = mu.home === id ? tot.away : tot.home;
    const score = `${fmtPoints(Math.max(mine, theirs))}–${fmtPoints(Math.min(mine, theirs))}`;
    const won = outcome?.winner === id;
    const prefix = day ? `${day}: ` : "";
    if (outcome?.decidedBy === "playoff")
      lines.push(
        prefix +
          (won
            ? `Beat ${teams[opp].name} in a sudden-death playoff after a ${score} tie`
            : `Lost to ${teams[opp].name} in a sudden-death playoff after a ${score} tie`),
      );
    else lines.push(prefix + (won ? `Beat ${teams[opp].name} ${score}` : `Lost to ${teams[opp].name} ${score}`));
  }
  return lines.join(". ");
}

export function money(usd: number): string {
  if (usd >= 1_000_000) return `$${+(usd / 1_000_000).toFixed(1)}M`;
  if (usd >= 1_000) return `$${Math.round(usd / 1_000)}K`;
  return `$${usd}`;
}
