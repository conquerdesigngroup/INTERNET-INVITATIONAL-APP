export type TeamId = "bryan" | "dalke" | "finch" | "ruffels";
export type Side = "home" | "away";
/** "unfinished" = called in before it was decided; no points, no record mark. */
export type Winner = Side | "halved" | "unfinished";
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
  day2Course?: string;
  day3Course?: string;
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
  /** Stage id from `stages`, e.g. "day1". */
  stage: string;
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
  /** Two names for pairs formats, one for singles. */
  players: string[];
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

/** A team of four in the Episode 5 knockout. */
export interface KnockoutTeam {
  captain: string;
  players: string[];
  result: "safe" | "out";
  note: string;
}

/** A team of three in the Episode 5 stroke-play semifinal. */
export interface SemiTeam {
  /** Colour key used for the team dot: blue, red, green or white. */
  id: string;
  name: string;
  color: string;
  players: string[];
  /** Score to par, e.g. 2 for +2. */
  toPar: number;
  result: "advanced" | "eliminated";
}

export interface Episode5 {
  course: string;
  knockout: {
    format: string;
    rosterNote?: string;
    teams: KnockoutTeam[];
    holes: { label: string; lines: string[] }[];
  };
  semifinal: {
    format: string;
    holes: number;
    teams: SemiTeam[];
  };
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
  episode5?: Episode5;
}
