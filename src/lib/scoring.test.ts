import { describe, expect, it } from "vitest";
import raw from "../../data/tournament.json";
import type { Tournament } from "./types";
import {
  contestTotal,
  fmtPoints,
  holesPlayed,
  matchPoints,
  playerRecords,
  sessionTotal,
  teamTotals,
} from "./scoring";

const t = raw as unknown as Tournament;

describe("matchPoints", () => {
  it("scores wins and halves", () => {
    expect(matchPoints("home")).toEqual({ home: 1, away: 0 });
    expect(matchPoints("away")).toEqual({ home: 0, away: 1 });
    expect(matchPoints("halved")).toEqual({ home: 0.5, away: 0.5 });
  });
});

describe("contest totals", () => {
  it("Finch–Ruffels is 8–8", () => {
    expect(contestTotal(t, "FR")).toEqual({ home: 8, away: 8 });
  });
  it("Dalke–Bryan is 5½–10½", () => {
    expect(contestTotal(t, "DB")).toEqual({ home: 5.5, away: 10.5 });
  });
  it("playoff matches don't count", () => {
    const playoff = sessionTotal(t, "FR", "P");
    expect(playoff.home + playoff.away).toBeGreaterThan(0);
    const s1 = sessionTotal(t, "FR", "1");
    const s2 = sessionTotal(t, "FR", "2");
    expect(contestTotal(t, "FR")).toEqual({ home: s1.home + s2.home, away: s1.away + s2.away });
  });
  it("session totals match the broadcast", () => {
    expect(sessionTotal(t, "FR", "1")).toEqual({ home: 4.5, away: 3.5 });
    expect(sessionTotal(t, "DB", "1")).toEqual({ home: 2, away: 6 });
  });
});

describe("player records", () => {
  const recs = playerRecords(t);
  it("every player has two Day 1 matches and no playoff marks", () => {
    for (const team of t.teams) for (const p of team.players) expect(recs.get(p.name)?.marks).toHaveLength(2);
  });
  it("Big John: W then L, playoff ignored", () => {
    expect(recs.get("Big John")).toEqual({ marks: ["W", "L"], points: 1, wins: 1 });
  });
  it("team totals agree with contest totals", () => {
    expect(teamTotals(t, "ruffels").points).toBe(8);
    expect(teamTotals(t, "bryan").points).toBe(10.5);
  });
});

describe("fmtPoints", () => {
  it("formats halves", () => {
    expect(fmtPoints(10.5)).toBe("10½");
    expect(fmtPoints(0.5)).toBe("½");
    expect(fmtPoints(8)).toBe("8");
    expect(fmtPoints(0)).toBe("0");
  });
});

describe("holesPlayed", () => {
  it("decodes results", () => {
    expect(holesPlayed("4&3")).toBe(6);
    expect(holesPlayed("1UP")).toBe(9);
    expect(holesPlayed("Halved")).toBe(9);
  });
});
