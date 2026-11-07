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
  it("Day 1 losers have two matches; Day 2 players three or four (no playoff marks)", () => {
    for (const team of t.teams)
      for (const p of team.players) {
        const n = recs.get(p.name)?.marks.length;
        if (team.id === "finch" || team.id === "dalke") expect(n).toBe(2);
        else expect([3, 4]).toContain(n);
      }
  });
  it("Big John: W, L, then two Day 2 wins, playoff ignored", () => {
    expect(recs.get("Big John")).toEqual({ marks: ["W", "L", "W", "W"], points: 3, wins: 3 });
  });
  it("team totals agree with contest totals", () => {
    expect(teamTotals(t, "ruffels").points).toBe(8 + 12.5);
    expect(teamTotals(t, "bryan").points).toBe(10.5 + 6.5);
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

describe("Day 2 (Bryan vs Ruffels)", () => {
  it("scramble is 2–6 and singles 4½–6½", () => {
    expect(sessionTotal(t, "BR", "3")).toEqual({ home: 2, away: 6 });
    expect(sessionTotal(t, "BR", "4")).toEqual({ home: 4.5, away: 6.5 });
  });
  it("Ruffels win 12½–6½ and unfinished singles score nothing", () => {
    expect(contestTotal(t, "BR")).toEqual({ home: 6.5, away: 12.5 });
    expect(matchPoints("unfinished")).toEqual({ home: 0, away: 0 });
    expect(t.matches.filter((m) => m.winner === "unfinished")).toHaveLength(5);
  });
  it("unfinished matches leave no record mark", () => {
    const recs = playerRecords(t);
    // The Duke: two Day 1 matches, the Ep 3 scramble win, and an unfinished single.
    expect(recs.get("The Duke")?.marks).toHaveLength(3);
    expect(recs.get("The Duke")?.marks.at(-1)).toBe("W");
  });
});
