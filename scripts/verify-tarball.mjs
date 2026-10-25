/**
 * Installs the packed tarball into a throwaway project and renders from it.
 *
 * `verify:package` reads `dist/` where it sits, inside a repo whose
 * `node_modules` holds every dependency. That misses a whole class of failure:
 * a file left out of `files`, a dependency that only resolved because it
 * happened to be installed nearby, an `exports` map that points somewhere the
 * build does not produce. All of those look fine in place and break on
 * `npm install`.
 *
 * This packs what npm would publish, installs it somewhere that has never seen
 * this repo, and renders a component out of it.
 *
 *   node scripts/verify-tarball.mjs [tarball-directory]
 *
 * With no argument it packs one itself, so it runs the same locally as in CI.
 */
import { execFileSync, execSync } from "node:child_process";
import { mkdtempSync, readdirSync, rmSync, writeFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));

const isWindows = process.platform === "win32";
const npm = isWindows ? "npm.cmd" : "npm";

/**
 * Runs a command, working around Node refusing to spawn a `.cmd` directly.
 *
 * Windows needs a shell for `npm.cmd`, but passing an argument array *and*
 * `shell: true` is deprecated — Node concatenates without escaping. So the
 * Windows path builds one quoted command string itself, which matters here:
 * these paths are temp directories and the user's home directory is in them,
 * and those contain spaces often enough to be the default assumption.
 */
function run(command, args, cwd) {
  if (isWindows && command.endsWith(".cmd")) {
    execSync([command, ...args].map(quoteForShell).join(" "), { cwd, stdio: "inherit" });
    return;
  }
  execFileSync(command, args, { cwd, stdio: "inherit" });
}

function quoteForShell(argument) {
  return /[\s"&|<>^]/.test(argument) ? `"${argument.replace(/"/g, '""')}"` : argument;
}

/** Where the tarball is, packing one if the caller did not. */
function locateTarball() {
  const provided = process.argv[2];
  const destination = provided ?? mkdtempSync(join(tmpdir(), "m2m-pack-"));

  if (!provided) {
    console.log("Packing…");
    run(npm, ["pack", "--pack-destination", destination], root);
  }

  const tarball = readdirSync(destination).find(
    (name) => name.startsWith(pkg.name.replace(/^@/, "").replace(/\//g, "-")) && name.endsWith(".tgz")
  );

  if (!tarball) {
    throw new Error(`No ${pkg.name} tarball found in ${destination}`);
  }

  return { path: join(destination, tarball), ownedByUs: !provided, directory: destination };
}

const { path: tarball, ownedByUs, directory } = locateTarball();
console.log(`Tarball: ${tarball}`);

const project = mkdtempSync(join(tmpdir(), "m2m-consumer-"));

try {
  writeFileSync(
    join(project, "package.json"),
    JSON.stringify({ name: "consumer-smoke", private: true, type: "module", version: "1.0.0" }, null, 2)
  );

  // The peer dependencies are the consumer's to provide, exactly as a real app
  // would. If the library has bundled its own copy of React, this is where the
  // two copies meet.
  const peers = Object.keys(pkg.peerDependencies ?? {}).map((name) => `${name}@${pkg.peerDependencies[name].split("||").pop().trim()}`);

  console.log("Installing into a fresh project…");
  run(npm, ["install", "--no-audit", "--no-fund", tarball, ...peers, "react-dom"], project);

  // Exercises the three things a consumer does first: import by package name,
  // read something from the public API, and render.
  writeFileSync(
    join(project, "smoke.mjs"),
    [
      'import { renderToStaticMarkup } from "react-dom/server";',
      'import { createElement } from "react";',
      'import * as lib from "my Design System";',
      "",
      'const required = ["Button", "DataTable", "ThemeProvider", "THEMES", "configureApiClient", "useServerResource"];',
      "const missing = required.filter((name) => !(name in lib));",
      "if (missing.length > 0) {",
      "  throw new Error(`Installed package is missing: ${missing.join(', ')}`);",
      "}",
      "",
      'const markup = renderToStaticMarkup(createElement(lib.Button, { variant: "primary" }, "Installed"));',
      'if (!markup.includes("Installed")) {',
      "  throw new Error(`A component from the installed package did not render. Got: ${markup}`);",
      "}",
      "",
      'console.log(`Installed package exposes ${Object.keys(lib).length} exports and renders.`);',
    ].join("\n")
  );

  run(process.execPath, ["smoke.mjs"], project);
  console.log("Tarball is installable and usable.");
} finally {
  rmSync(project, { recursive: true, force: true });
  if (ownedByUs) rmSync(directory, { recursive: true, force: true });
}
