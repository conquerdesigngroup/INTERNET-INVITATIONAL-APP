import { describe, expect, it } from "vitest";
import raw from "../../data/tournament.json";
import type { Tournament } from "./types";
import { handicapValue, holeTallies, marginOf, pairLines, playerLines, teamSessionLines, worm } from "./stats";

const t = raw as unknown as Tournament;

describe("marginOf", () => {
  it("reads match-play results", () => {
    expect(marginOf("4&3")).toBe(4);
    expect(marginOf("2UP")).toBe(2);
    expect(marginOf("1UP")).toBe(1);
    expect(marginOf("Halved")).toBe(0);
    expect(marginOf("Won")).toBe(0);
  });
});

describe("worm", () => {
  it("ends on the contest totals and skips the playoff", () => {
    const fr = worm(t, "FR");
    expect(fr).toHaveLength(16);
    expect(fr.at(-1)).toMatchObject({ home: 8, away: 8 });
    expect(worm(t, "DB").at(-1)).toMatchObject({ home: 5.5, away: 10.5 });
  });
  it("is 4½–3½ Finch at lunch", () => {
    expect(worm(t, "FR")[7]).toMatchObject({ home: 4.5, away: 3.5 });
  });
});

describe("teamSessionLines", () => {
  it("splits points by session", () => {
    const bryan = teamSessionLines(t).get("bryan")!;
    expect(bryan.get("1")?.points).toBe(6);
    expect(bryan.get("2")?.points).toBe(4.5);
    expect(bryan.has("P")).toBe(false);
  });
  it("net holes are zero-sum within a contest", () => {
    const L = teamSessionLines(t);
    const net = (id: "finch" | "ruffels") => [...L.get(id)!.values()].reduce((n, l) => n + l.net, 0);
    expect(net("finch") + net("ruffels")).toBe(0);
  });
});

describe("players and pairs", () => {
  it("every player played twice and points add up to 64", () => {
    const lines = playerLines(t);
    expect(lines).toHaveLength(64);
    expect(lines.every((l) => l.played === 2)).toBe(true);
    expect(lines.reduce((n, l) => n + l.points, 0)).toBe(64);
  });
  it("has two pairs per counting match", () => {
    expect(pairLines(t)).toHaveLength(64);
  });
});

describe("handicapValue", () => {
  it("treats + as better than scratch", () => {
    expect(handicapValue("+7.2")).toBe(-7.2);
    expect(handicapValue("12.6")).toBe(12.6);
    expect(handicapValue(null)).toBeNull();
  });
});

describe("holeTallies", () => {
  it("all 16 matches start, and every match finishes somewhere", () => {
    for (const s of ["1", "2"]) {
      const h = holeTallies(t, s);
      expect(h[0].live).toBe(16);
      expect(h.reduce((n, x) => n + x.decided, 0)).toBe(16);
    }
  });
  it("ignores the playoff", () => {
    expect(holeTallies(t, "P").every((x) => x.live === 0)).toBe(true);
  });
});
