import raw from "../../data/photos.json";

const photos: Record<string, string> = raw.photos;

/** File-safe slug for a player name, e.g. "Seb Carmichael-Brown" -> "seb-carmichael-brown". */
export function playerSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

/** Local path of a player's headshot (downloaded at build time), or null if we have no source for one. */
export function photoPath(name: string): string | null {
  const src = photos[name];
  if (!src) return null;
  const ext = src.match(/\.(png|jpe?g|webp)$/i)?.[1].toLowerCase() ?? "png";
  return `/players/${playerSlug(name)}.${ext}`;
}

/** "Big John" -> "BJ", "Biz" -> "B", "PFT Commenter" -> "PC". */
export function initials(name: string): string {
  return name
    .split(/[\s-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

export const photoSources = photos;
