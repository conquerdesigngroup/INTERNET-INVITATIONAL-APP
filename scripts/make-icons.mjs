// Renders public/icons/icon.svg to the PNG sizes the manifest and iOS need.
// Usage: npm run icons  (needs Playwright; for a global install: NODE_PATH=$(npm root -g) npm run icons)
import { createRequire } from "node:module";
// CommonJS require so a global Playwright install (NODE_PATH) works too.
const { chromium } = createRequire(import.meta.url)("playwright");
import { readFile } from "node:fs/promises";

const svg = await readFile(new URL("../public/icons/icon.svg", import.meta.url), "utf8");
const sizes = [
  ["icon-192.png", 192, false],
  ["icon-512.png", 512, false],
  ["maskable-512.png", 512, true],
  ["apple-touch-icon.png", 180, true],
];
const browser = await chromium.launch();
const page = await browser.newPage();
for (const [name, size, full] of sizes) {
  // Maskable/apple icons get a square, full-bleed background (the OS applies its own mask).
  const inner = full ? svg.replace('rx="112"', 'rx="0"') : svg;
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(
    `<html><head><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@900&display=block"></head>
     <body style="margin:0;background:transparent">${inner.replace("<svg ", `<svg width="${size}" height="${size}" `)}</body></html>`,
  );
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `public/icons/${name}`, omitBackground: !full });
}
await browser.close();
console.log("icons written");
