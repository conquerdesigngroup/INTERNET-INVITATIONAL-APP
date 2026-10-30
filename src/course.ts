/**
 * Course facts for the Course view. Day 1 was played at Ozarks National (Coore & Crenshaw, 2018):
 * the Episode 1 scramble on the front nine, the Episode 2 alternate shot on the back nine,
 * and the sudden-death playoff on 18. Update when later days move to another course.
 */

export interface Hole {
  n: number;
  par: number;
  /** Back ("Ozarks") tees. TV setup may differ. */
  yards: number;
  /** Stroke index, 1 = hardest. */
  hcp: number;
}

export interface HoleMoment {
  hole: number;
  text: string;
  match?: string;
}

export const DAY1_COURSE = {
  name: "Ozarks National",
  designer: "Bill Coore & Ben Crenshaw",
  opened: 2018,
  par: 71,
  yards: 7036,
  lat: 36.5590447545,
  lon: -93.1873172934,
  scorecardSource: "https://courses.opengolfapi.org/courses/mo/ozarks-national",
};

// Ozarks tees, from OpenGolfAPI.
export const HOLES: Hole[] = [
  { n: 1, par: 5, yards: 517, hcp: 8 },
  { n: 2, par: 3, yards: 167, hcp: 18 },
  { n: 3, par: 4, yards: 345, hcp: 14 },
  { n: 4, par: 4, yards: 446, hcp: 2 },
  { n: 5, par: 4, yards: 352, hcp: 10 },
  { n: 6, par: 3, yards: 216, hcp: 12 },
  { n: 7, par: 5, yards: 543, hcp: 6 },
  { n: 8, par: 3, yards: 178, hcp: 16 },
  { n: 9, par: 5, yards: 597, hcp: 4 },
  { n: 10, par: 4, yards: 469, hcp: 13 },
  { n: 11, par: 5, yards: 531, hcp: 9 },
  { n: 12, par: 3, yards: 254, hcp: 11 },
  { n: 13, par: 4, yards: 480, hcp: 3 },
  { n: 14, par: 4, yards: 450, hcp: 5 },
  { n: 15, par: 4, yards: 407, hcp: 15 },
  { n: 16, par: 4, yards: 481, hcp: 1 },
  { n: 17, par: 3, yards: 144, hcp: 17 },
  { n: 18, par: 4, yards: 459, hcp: 7 },
];

/** Which session played which nine. */
export const NINES: { session: string; first: number; label: string }[] = [
  { session: "1", first: 1, label: "Front nine · Ep 1 scramble" },
  { session: "2", first: 10, label: "Back nine · Ep 2 alternate shot" },
];

/** Shots the show and recaps tied to a specific hole. */
export const HOLE_MOMENTS: HoleMoment[] = [
  { hole: 5, text: "Sam Heung Min and Claire Hogle rolled in a 60-foot eagle putt in the scramble, the shot of the morning.", match: "m12" },
  { hole: 6, text: "Malosi Togisala chipped in on the par-3 6th on the way to a 4&3 win.", match: "m08" },
  { hole: 9, text: "Chaz Bowker's putt saved the half against Dalke and Toney, and Bubbie Broders holed the last putt of the session to halve with Borrelli and Ellis.", match: "m09" },
  { hole: 14, text: "Cheddy bent his putter in frustration during a 3&2 loss to Nutt and Richards.", match: "m25" },
  { hole: 16, text: "Trent Ryan and Jersey Jerry lost the 16th in a bunker battle (an 8 beat a 9) but held on to win.", match: "m17" },
  { hole: 17, text: "Jon Gruden holed a putt to go 1 up on Borrelli and Ellis. Kwon and Togisala matched a Fat Perez birdie to close out 2&1.", match: "m22" },
  { hole: 18, text: "Horvat holed to beat Steele and Short Game King 1UP, and Bobby Ray played the wrong ball, turning a Ruffels win into the halve that forced 8–8.", match: "m20" },
  { hole: 18, text: "Playoff: both teams made par from the same fairway bunker on the first extra hole. On the second, Horvat splashed out and Big John holed the birdie putt.", match: "m34" },
];

export interface ResortCourse {
  name: string;
  lat: number;
  lon: number;
  designer: string;
  kind: string;
  role?: string;
}

/** Big Cedar Lodge courses with coordinates from OpenGolfAPI. */
export const RESORT: ResortCourse[] = [
  { name: "Ozarks National", lat: 36.5590447545, lon: -93.1873172934, designer: "Coore & Crenshaw", kind: "18 holes · par 71", role: "Day 1 · Eps 1–2" },
  { name: "Payne's Valley", lat: 36.5648719041, lon: -93.2033565729, designer: "Tiger Woods", kind: "18 + bonus 19th · par 72", role: "2025 final" },
  { name: "Buffalo Ridge", lat: 36.5758008745, lon: -93.1936311722, designer: "Tom Fazio", kind: "18 holes · par 71" },
  { name: "Top of the Rock", lat: 36.5428386495, lon: -93.2490694431, designer: "Jack Nicklaus", kind: "9-hole par 3" },
];

export const mapsLink = (lat: number, lon: number, q: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}&center=${lat},${lon}`;

export const appleMapsLink = (lat: number, lon: number, q: string) =>
  `https://maps.apple.com/?q=${encodeURIComponent(q)}&ll=${lat},${lon}&t=k`;
