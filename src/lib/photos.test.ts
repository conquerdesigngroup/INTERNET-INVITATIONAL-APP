import { describe, expect, it } from "vitest";
import raw from "../../data/tournament.json";
import type { Tournament } from "./types";
import { initials, photoPath, playerSlug } from "./photos";

const T = raw as unknown as Tournament;

describe("player photos", () => {
  it("has a photo source for every player", () => {
    const missing = T.teams.flatMap((t) => t.players).filter((p) => !photoPath(p.name)).map((p) => p.name);
    expect(missing).toEqual([]);
  });

  it("builds file-safe paths and initials", () => {
    expect(playerSlug("Seb Carmichael-Brown")).toBe("seb-carmichael-brown");
    expect(photoPath("Taco Golf")).toBe("/players/taco-golf.jpg");
    expect(initials("Big John")).toBe("BJ");
    expect(initials("Biz")).toBe("B");
    expect(initials("Seb Carmichael-Brown")).toBe("SC");
  });
});
