/**
 * Editorial copy that isn't in data/tournament.json. Scores and records are
 * always computed from the data; this file only holds words. Update it
 * alongside the JSON after each episode.
 */

export const standingsIntro = {
  title: "Day 2 is done",
  text: "Team Ruffels beat Team Bryan 12½–6½ at Buffalo Ridge and are the last 16 standing. Next, Portnoy splits them into four teams of four and sends four more home in Episode 5.",
};

/** One-line story under each Day 1 scoreboard, keyed by matchup. */
export const boardStories: Record<string, string> = {
  BR: "Same teams as Day 1. Ruffels won the morning scramble 6–2, then 6½–4½ in the singles. Salim's comeback win over Kyle Forgeard clinched it, and the last five singles were called in unfinished.",
  FR: "Finch led 4½–3½ at lunch. Ruffels took the afternoon 4½–3½ to tie it at 8–8, then won on the second sudden-death hole when Big John holed a putt after Grant Horvat's bunker shot.",
  DB: "Bryan led 6–2 at lunch and won the afternoon 4½–3½. Defending champion Brad Dalke and his whole team are out.",
};

/** Bracket detail panels for teams. */
export const teamBlurbs: Record<string, string> = {
  finch: "Captain Peter Finch. Led 4½–3½ after the scramble, lost the alternate shot 3½–4½, then lost the sudden-death playoff. Eliminated with defending champion Francis Ellis.",
  ruffels: "Captain Ryan Ruffels, the lowest handicap in the field at +7.2. Beat Finch in a Day 1 playoff, then beat Bryan 12½–6½ on Day 2. All 16 players are still alive, now split into four teams of four for Episode 5.",
  dalke: "Captain Brad Dalke, a 2025 champion. Trailed 2–6 after the scramble and finished 5½–10½. Eliminated.",
  bryan: "Captain Wesley Bryan. The most dominant team on Day 1 (10½–5½ over Dalke), then lost Day 2 to Ruffels 6½–12½. Eliminated.",
};

/** Extra bullet points for Day 1 bracket nodes, keyed by matchup. */
export const matchupBullets: Record<string, string[]> = {
  FR: [
    "Playoff hole 1: Ruffels/Morris halved Finch/Kwon (both in the same fairway bunker)",
    "Playoff hole 2: Horvat bunker shot, Big John holes the putt. Ruffels advance.",
  ],
  DB: ["Bryan never trailed."],
  BR: [
    "Both teams used their one Kevin Kisner shot on the same par 3 in Salim/Gruden vs PFT/Callux.",
    "Five singles were called in unfinished once Ruffels reached 12½.",
  ],
};

/** Detail for stages that haven't aired. Keyed by stage id. */
export const stageDetails: Record<string, { title: string; text: string; bullets: string[] }> = {
  day2: {
    title: "Day 2 · Bryan vs Ruffels",
    text: "No redraft: the Day 1 winners kept their teams. 8 scramble matches in the morning, then 16 singles at Buffalo Ridge, 1 point each. 12½ of 24 clinched.",
    bullets: [
      "Each team could call in Kevin Kisner for one shot per session.",
      "The par-3 9th in the scramble was worth $50K per group. The Duke won it for himself and Bobby Ray.",
      "Ruffels won 12½–6½. Team Bryan's 16 players are out.",
    ],
  },
  semi: {
    title: "Episode 5 · Four teams of four",
    text: "Not aired yet. Ruffels' 16 survivors were drafted into four teams of four, and four players go home.",
    bullets: [
      "Team Big John: Big John, Fat Perez, Bobby Ray, Jon Gruden",
      "Team Grant: Grant Horvat, Jake Adams, Riggs, Paige Spiranac",
      "Team Micah: Micah Morris, Ryan Whitney, Bubbie Broders, Salim",
      "Team Ruffels: Ryan Ruffels, Marissa Wenzler, Justin Gaethje, The Duke",
      "Captains play the first hole and the best score is safe. Second picks play the next hole and the worst score sends that whole team home; a tie goes to the third picks.",
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
