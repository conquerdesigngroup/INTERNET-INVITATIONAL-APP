// Downloads player headshots listed in data/photos.json into public/players/ so the app serves them itself.
// Runs before every build. Never fails the build: a photo that can't be fetched just falls back to initials in the app.
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";

const { photos } = JSON.parse(await readFile(new URL("../data/photos.json", import.meta.url), "utf8"));
const dir = new URL("../public/players/", import.meta.url);
await mkdir(dir, { recursive: true });

const slug = (n) => n.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const exists = (u) => stat(u).then((s) => s.size > 0, () => false);

let got = 0, cached = 0;
const failed = [];
await Promise.all(
  Object.entries(photos).map(async ([name, src]) => {
    const ext = src.match(/\.(png|jpe?g|webp)$/i)?.[1].toLowerCase() ?? "png";
    const out = new URL(`${slug(name)}.${ext}`, dir);
    if (await exists(out)) return cached++;
    try {
      const res = await fetch(src, { signal: AbortSignal.timeout(15000), headers: { "user-agent": "internet-invitational-app build" } });
      const type = res.headers.get("content-type") ?? "";
      if (!res.ok || !type.startsWith("image/")) throw new Error(`${res.status} ${type}`);
      await writeFile(out, Buffer.from(await res.arrayBuffer()));
      got++;
    } catch (e) {
      failed.push(name);
      if (failed.length === 1) console.log(`  first photo error: ${e.message}`);
    }
  }),
);
console.log(`player photos: ${got} downloaded, ${cached} already present, ${failed.length} unavailable`);
if (failed.length) console.log(`  initials fallback for: ${failed.join(", ")}`);
