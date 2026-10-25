// Copies src/theme.css to dist/theme.css unprocessed.
// This file must stay raw (not run through the library's own Tailwind
// build) because it's meant to be @import-ed into a CONSUMER app's own
// Tailwind pipeline, so their build generates bg-canvas/bg-accent/etc.
// utilities that respond to ThemeProvider's runtime variable swaps.
import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const src = resolve(root, "../src/theme.css");
const destDir = resolve(root, "../dist");
const dest = resolve(destDir, "theme.css");

mkdirSync(destDir, { recursive: true });
copyFileSync(src, dest);
console.log("[copy-theme-css] src/theme.css -> dist/theme.css");

const dtsSrc = resolve(root, "../src/index.d.ts");
const dtsDest = resolve(destDir, "index.d.ts");
copyFileSync(dtsSrc, dtsDest);
console.log("[copy-types] src/index.d.ts -> dist/index.d.ts");
