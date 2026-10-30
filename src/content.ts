/**
 * Editorial copy that isn't in data/tournament.json. Scores and records are
 * always computed from the data; this file only holds words. Update it
 * alongside the JSON after each episode.
 */

export const standingsIntro = {
  title: "Day 1 is done",
  text: "Two head-to-head contests, 16 points each (8 scramble + 8 alternate shot). The winner of each moved on with all 16 players. The losers went home.",
};

/** One-line story under each Day 1 scoreboard, keyed by matchup. */
export const boardStories: Record<string, string> = {
  FR: "Finch led 4½–3½ at lunch. Ruffels took the afternoon 4½–3½ to tie it at 8–8, then won on the second sudden-death hole when Big John holed a putt after Grant Horvat's bunker shot.",
  DB: "Bryan led 6–2 at lunch and won the afternoon 4½–3½. Defending champion Brad Dalke and his whole team are out.",
};

/** Bracket detail panels for teams. */
export const teamBlurbs: Record<string, string> = {
  finch: "Captain Peter Finch. Led 4½–3½ after the scramble, lost the alternate shot 3½–4½, then lost the sudden-death playoff. Eliminated with defending champion Francis Ellis.",
  ruffels: "Captain Ryan Ruffels, the lowest handicap in the field at +7.2. Picked Finch as their opponent after winning the captains' closest-to-the-pin, and came back from 3½–4½ down at lunch.",
  dalke: "Captain Brad Dalke, a 2025 champion. Trailed 2–6 after the scramble and finished 5½–10½. Eliminated.",
  bryan: "Captain Wesley Bryan. The most dominant team on Day 1: won the scramble 6–2 and the alternate shot 4½–3½.",
};

/** Extra bullet points for Day 1 bracket nodes, keyed by matchup. */
export const matchupBullets: Record<string, string[]> = {
  FR: [
    "Playoff hole 1: Ruffels/Morris halved Finch/Kwon (both in the same fairway bunker)",
    "Playoff hole 2: Horvat bunker shot, Big John holes the putt. Ruffels advance.",
  ],
  DB: ["Bryan never trailed."],
};

/** Detail for stages that haven't aired. Keyed by stage id. */
export const stageDetails: Record<string, { title: string; text: string; bullets: string[] }> = {
  day2: {
    title: "Day 2",
    text: "The two surviving teams carry all their players into Episode 3. Day 2's exact format hasn't aired yet.",
    bullets: [
      "In 2025, Day 2 opened with the survivors re-drafted into two brand-new teams under newly voted captains.",
      "Every hole carried a skin ($4K per hole in 2025), paid on top of the match result.",
      "Scramble in the morning, alternate shot in the afternoon, and the losing team went home.",
    ],
  },
  semi: {
    title: "Semifinal",
    text: "Not aired yet. Sketched from 2025.",
    bullets: [
      "In 2025 the last 12 were split into four teams of three.",
      "They played an 18-hole alternate-shot stroke-play round on the Cliffhangers par-3 course.",
      "The top two teams advanced to the final; the other two went home.",
    ],
  },
  final: {
    title: "The final",
    text: "Two three-player teams, 18 holes of alternate-shot match play. The winning trio splits the prize and lifts the trophy.",
    bullets: [
      "2025 final: Dalke, Ellis and Franke beat Spiranac, Togisala and Borrelli 1UP when Borrelli's chip on 18 went over the green into the water.",
    ],
  },
};
