export type TeamId = "bryan" | "dalke" | "finch" | "ruffels";
export type Side = "home" | "away";
export type Winner = Side | "halved";
export type RecordMark = "W" | "H" | "L";

export interface Bonus {
  name: string;
  amountUSD: number;
  detail: string;
}

export interface Meta {
  event: string;
  edition: number;
  updatedThrough: string;
  updatedAt: string;
  venue: string;
  day1Course: string;
  host: string;
  rulesOfficial: string;
  presentedBy: string[];
  prizeTotalUSD: number;
  prizePerWinnerUSD: number;
  bonuses: Bonus[];
  trophy: string;
  sources: string[];
}

export interface Episode {
  n: number;
  date: string;
  timeET: string;
  status: "released" | "upcoming";
  summary: string | null;
}

export interface Session {
  episode: number;
  format: string;
  holes: number | null;
  label: string;
  countsTowardPoints?: boolean;
}

export interface Matchup {
  home: TeamId;
  away: TeamId;
  label: string;
}

export interface MatchupOutcome {
  winner: TeamId;
  decidedBy: "points" | "playoff";
  note: string;
}

export interface Stage {
  id: string;
  label: string;
  status: "complete" | "upcoming";
  players?: number;
  playersAfter?: number;
  format?: string;
  confirmed?: boolean;
  expectedFrom2025?: string;
}

export interface Player {
  name: string;
  /** "+" means better than scratch; null = unknown */
  handicap: string | null;
  isCaptain: boolean;
}

export interface Team {
  id: TeamId;
  name: string;
  captain: string;
  color: string;
  status: "advanced" | "eliminated";
  players: Player[];
}

export interface MatchSide {
  team: TeamId;
  players: [string, string];
}

export interface Match {
  id: string;
  session: string;
  matchup: string;
  home: MatchSide;
  away: MatchSide;
  result: string;
  winner: Winner;
  note: string | null;
}

export interface Moment {
  title: string;
  text: string;
}

export interface Tournament {
  meta: Meta;
  episodes: Episode[];
  sessions: Record<string, Session>;
  matchups: Record<string, Matchup>;
  matchupOutcomes: Record<string, MatchupOutcome>;
  stages: Stage[];
  teams: Team[];
  matches: Match[];
  moments: Moment[];
}
