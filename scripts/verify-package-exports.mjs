import { existsSync, readFileSync } from "node:fs";
import { readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourceEntry = resolve(root, "src/index.js");
const bundleEntry = resolve(root, "dist/index.es.js");
const pkg = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));

/** Every source file that ships, for checking what the build did with them. */
function listSourceFiles(directory) {
  const found = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "__tests__" || entry.name === "test") continue;
      found.push(...listSourceFiles(path));
    } else if (/\.jsx?$/.test(entry.name) && !/\.(test|spec)\./.test(entry.name)) {
      found.push(path);
    }
  }
  return found;
}

const sourceFiles = listSourceFiles(resolve(root, "src"));

function resolveLocalModule(fromFile, specifier) {
  const base = resolve(dirname(fromFile), specifier);
  if (/\.jsx?$/.test(specifier) && existsSync(base)) return base;

  const candidates = [
    `${base}.js`,
    `${base}.jsx`,
    resolve(base, "index.js"),
    resolve(base, "index.jsx"),
  ];

  return candidates.find(existsSync);
}

function collectExports(file, visited = new Set()) {
  if (visited.has(file)) return new Set();
  visited.add(file);

  const source = readFileSync(file, "utf8");
  const names = new Set();
  const exportAll = /export\s+\*\s+from\s+["']([^"']+)["'];?/g;
  const namedExport = /export\s*{\s*([^}]+?)\s*}(?:\s*from\s*["']([^"']+)["'])?\s*;?/gs;

  for (const match of source.matchAll(exportAll)) {
    const target = resolveLocalModule(file, match[1]);
    if (!target) throw new Error(`Cannot resolve ${match[1]} from ${file}`);
    for (const name of collectExports(target, visited)) names.add(name);
  }

  for (const match of source.matchAll(namedExport)) {
    for (const specifier of match[1].split(",")) {
      const [, exportedName] = specifier.trim().split(/\s+as\s+/);
      const name = exportedName ?? specifier.trim();
      if (name && name !== "default") names.add(name);
    }
  }

  return names;
}

/**
 * Every symbol the component files actually declare as exported.
 *
 * This used to assume the filename was the export name, which is close enough
 * to true for a component but wrong for anything else: `chartTheme.jsx` exports
 * `ChartTooltip`, `CHART_SERIES_COLOURS` and `chartAxisStyle` and no
 * `chartTheme` at all, and a test file exports nothing. Reading the declared
 * names instead makes this check the thing it is named after — that everything
 * a component file offers is reachable from the package — rather than a
 * filename convention.
 */
function collectComponentNames(directory) {
  const names = new Set();

  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);

    if (entry.isDirectory()) {
      // Tests are not part of the public surface.
      if (entry.name === "__tests__") continue;
      for (const name of collectComponentNames(path)) names.add(name);
      continue;
    }

    if (!/\.jsx?$/.test(entry.name)) continue;
    // Neither tests nor stories are part of the public surface. A story file
    // sits next to the component it documents and exports one name per story
    // (`Playground`, `Sizes`, `WithIcon`…); without this the check demanded
    // the package re-export all of them.
    if (/\.(test|spec|stories)\./.test(entry.name)) continue;

    const source = readFileSync(path, "utf8");

    for (const match of source.matchAll(
      /export\s+(?:async\s+)?(?:function|const|class)\s+([A-Za-z_$][\w$]*)/g
    )) {
      names.add(match[1]);
    }

    // `export { A, B }` blocks, but not `export { A } from "./x"` — a
    // re-export is the other file's to account for.
    for (const match of source.matchAll(/export\s*\{([^}]*)\}\s*(?!from)(?:;|\n)/g)) {
      for (const specifier of match[1].split(",")) {
        const name = specifier.split(/\s+as\s+/).pop().trim();
        if (name && name !== "default") names.add(name);
      }
    }
  }

  return names;
}

const expectedExports = [...collectExports(sourceEntry)].sort();
for (const directory of [resolve(root, "src/components"), resolve(root, "src/pages")]) {
  for (const name of collectComponentNames(directory)) expectedExports.push(name);
}
expectedExports.sort();
const publicApi = await import(pathToFileURL(bundleEntry).href);
const missingExports = expectedExports.filter((name) => !(name in publicApi));

if (missingExports.length > 0) {
  throw new Error(`Missing package exports: ${missingExports.join(", ")}`);
}

// The theme API has to be present and usable.
for (const name of ["ThemeProvider", "ThemeSwitcher", "useTheme", "THEMES", "CSS_VAR_MAP"]) {
  if (!publicApi[name]) throw new Error(`Theme API is incomplete: ${name} is not exported.`);
}

const availableThemes = Object.keys(publicApi.THEMES ?? {});
if (availableThemes.length === 0) {
  throw new Error("Theme API is incomplete: no themes are defined.");
}

// Every theme must define every token.
//
// This replaces a hardcoded list of theme names, which had drifted from the
// source: it demanded an "amber-sunrise" that has never existed, so this script
// — and with it `prepublishOnly` — could not pass. A list of names also only
// ever caught a deleted theme, and never the failure that actually shows up in
// front of someone: a theme missing one token, which leaves that CSS variable
// unset and renders as an invisible control or unreadable text on that theme
// alone. Checking the source of truth catches both.
const tokenNames = Object.keys(publicApi.CSS_VAR_MAP ?? {});
const incompleteThemes = [];

for (const [themeName, tokens] of Object.entries(publicApi.THEMES)) {
  const missing = tokenNames.filter((token) => tokens?.[token] === undefined);
  if (missing.length > 0) incompleteThemes.push(`${themeName} (missing ${missing.join(", ")})`);
}

if (incompleteThemes.length > 0) {
  throw new Error(`Themes are missing tokens: ${incompleteThemes.join("; ")}`);
}

const bundle = readFileSync(bundleEntry, "utf8");
for (const variable of ["canvas-bg", "chrome-bg", "card-bg", "text-primary"]) {
  if (!bundle.includes(`var(--${variable})`)) {
    throw new Error(`The compiled styles do not reference --${variable} at runtime.`);
  }
}

// Nothing the package declares as a dependency may be bundled into it.
//
// Bundling React means the consumer ends up with two copies, and two copies
// means two sets of contexts — hooks throw, providers silently fail to reach
// their children. Bundling the rest just makes everyone download it twice.
// This is asserted rather than trusted because it is invisible until it is a
// support ticket: the build succeeds, the bundle merely gets bigger.
// Checked by asserting the opposite of "bundled": a dependency the source
// imports must still be imported by the built output. If it were bundled there
// would be no import statement left to find — which makes this a direct
// observation rather than a guess about what bundled code looks like.
const declared = Object.keys({ ...pkg.dependencies, ...pkg.peerDependencies });
const bundledIn = [];

for (const name of declared) {
  const usedBySource = sourceFiles.some((file) =>
    new RegExp(`from\\s*["']${name}(?:/[^"']*)?["']`).test(readFileSync(file, "utf8"))
  );
  if (!usedBySource) continue;

  const stillExternal = new RegExp(`from\\s*["']${name}(?:/[^"']*)?["']`).test(bundle);
  if (!stillExternal) bundledIn.push(name);
}

if (bundledIn.length > 0) {
  throw new Error(
    `Declared as dependencies but bundled into the output: ${bundledIn.join(", ")}. ` +
      "Check the `external` list in vite.config.js."
  );
}

// The bundle loads — but loading is not rendering, and the failure that
// matters most (a broken React reference) only shows up when something is
// actually rendered.
const { renderToStaticMarkup } = await import("react-dom/server");
const { createElement } = await import("react");

const markup = renderToStaticMarkup(
  createElement(publicApi.Badge, { tone: "warn" }, "Renders")
);

if (!markup.includes("Renders")) {
  throw new Error(`A component from the built package did not render. Got: ${markup}`);
}

console.log(
  `Verified ${expectedExports.length} public exports, ${availableThemes.length} themes ` +
    `(${tokenNames.length} tokens each), no bundled dependencies, and a live render.`
);
