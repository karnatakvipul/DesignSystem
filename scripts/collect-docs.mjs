/**
 * Copies the shipped markdown into the docs site before it builds.
 *
 * The root files are the canonical ones — they are what npm publishes and what
 * GitHub renders, so they have to stay where they are. Writing the same content
 * again inside `docs/` would give two copies that drift, and the one people read
 * would be whichever they happened to open.
 *
 * So the site is generated from them. Copies are gitignored; nobody should edit
 * the ones under `docs/`.
 */
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const docs = join(root, "docs");

/** source file -> page path in the site */
const PAGES = {
  "DESIGN-SYSTEM.md": "design-system.md",
  "BUILDING-AN-APP.md": "building-an-app.md",
  "CONTRIBUTING.md": "contributing.md",
  "CHANGELOG.md": "changelog.md",
  "DOCUMENTATION.md": "components.md",
};

/**
 * Where each source file ends up as a route.
 *
 * The files cross-reference each other by filename, which is right on GitHub and
 * dead in the site, because the pages are renamed on the way in. Rewriting here
 * keeps both correct from one source — the alternative is links that work in
 * whichever place you are not currently looking.
 */
const ROUTES = {
  "README.md": "/",
  "DESIGN-SYSTEM.md": "/design-system",
  "BUILDING-AN-APP.md": "/building-an-app",
  "CONTRIBUTING.md": "/contributing",
  "CHANGELOG.md": "/changelog",
  "DOCUMENTATION.md": "/components",
};

function rewriteLinks(markdown) {
  let result = markdown;
  for (const [file, route] of Object.entries(ROUTES)) {
    // `](./FILE.md)` and `](FILE.md)`, with or without an anchor.
    const pattern = new RegExp(`\\]\\((?:\\./)?${file.replace(".", "\\.")}(#[^)]*)?\\)`, "g");
    result = result.replace(pattern, (_, anchor) => `](${route}${anchor ?? ""})`);
  }
  return result;
}

/**
 * VitePress compiles each page as a Vue template, and `{{ … }}` is Vue's
 * interpolation syntax — inside an inline `code` span too, which markdown
 * makes it very easy to write by accident when documenting a JSX prop
 * (`keys={{ site: "siteName" }}`).
 *
 * Both ways it goes wrong are silent from the author's side. If the contents
 * happen to parse as a JS expression, Vue evaluates it against a component
 * that has no such data and renders nothing — the docs shipped
 * "the `value=` API" where the source said "the `value={{from,to}}` API". If
 * they don't parse, `docs:build` fails with a position in the *compiled*
 * output that points nowhere near the markdown that caused it.
 *
 * Fenced blocks are safe (VitePress escapes those), so this only looks at
 * inline spans. Rephrase rather than escape — prose that names the field is
 * clearer than a brace-doubled literal anyway.
 */
function assertNoVueInterpolation(markdown, source) {
  const lines = markdown.split("\n");
  const offenders = [];
  let inFence = false;

  lines.forEach((line, index) => {
    if (line.trimStart().startsWith("```")) {
      inFence = !inFence;
      return;
    }
    if (inFence) return;

    for (const span of line.match(/`[^`]*`/g) ?? []) {
      if (span.includes("{{")) offenders.push(`${source}:${index + 1}  ${span.trim()}`);
    }
  });

  if (offenders.length > 0) {
    throw new Error(
      `Vue would treat these inline code spans as interpolation, so the docs site ` +
        `would drop or fail on them. Rephrase to avoid '{{':\n  ${offenders.join("\n  ")}`
    );
  }
}

mkdirSync(docs, { recursive: true });

const banner = (source) =>
  `<!-- Generated from ${source} by scripts/collect-docs.mjs. Edit that file, not this one. -->\n\n`;

let copied = 0;
for (const [source, page] of Object.entries(PAGES)) {
  const from = join(root, source);
  if (!existsSync(from)) {
    console.warn(`  skipped ${source} — not found`);
    continue;
  }

  const { readFileSync } = await import("node:fs");
  const markdown = readFileSync(from, "utf8");
  assertNoVueInterpolation(markdown, source);
  writeFileSync(join(docs, page), banner(source) + rewriteLinks(markdown));
  copied += 1;
}

console.log(`[collect-docs] ${copied} page(s) generated into docs/`);
