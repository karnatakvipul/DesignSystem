# Contributing

## What runs on every push

`.github/workflows/ci.yml` runs four checks on Node 20 and 22, plus a fifth that
installs the packed tarball into a fresh project:

| Command | What it protects |
|---|---|
| `npm run lint:ci` | Style, and a ceiling on warnings (below) |
| `npm test` | Behaviour |
| `npm run build` | That it compiles at all |
| `npm run verify:package` | The built output: exports reachable, themes complete, no dependency bundled in, a component renders |
| `npm run verify:tarball` | That `npm install my Design System` works from outside this repo |

All five run locally too, and are worth running before pushing.

## The warning ceiling

`npm run lint:ci` passes `--max-warnings=58`, which is where the count stands.
Warnings cannot grow; they can only be paid down.

**When you fix some, lower the number.** Leaving it high turns the ceiling into
decoration.

It was 518 until `react/jsx-uses-vars` was switched on. That rule is what tells
`no-unused-vars` a name used in JSX is used at all, and without it every
component imported for its markup was reported unused — roughly 460 warnings of
pure noise, which is more than enough to stop anyone reading the list.

What is left is worth reading:

- **57 `no-unused-vars`**, mostly `import React` in files that only write JSX.
  The automatic runtime does not need it, so these are real and safe to delete.
- **1 `no-console`**.

The `react-hooks/exhaustive-deps` warnings are gone. They were all the same
missing `serverBinding` in the page components, fixed by depending on the
binding's setters — which are stable — rather than on the binding object, which
is a new one every render and cannot go in a dependency array without looping.

## Accessibility

`src/components/common/__tests__/accessibility.test.jsx` runs axe over the
components an application cannot avoid, and asserts zero violations. It runs as
part of `npm test`, so a regression fails CI like any other.

Two page-composition rules are switched off there — `region` and
`landmark-unique` — because they judge how a whole page is assembled, which a
component rendered on its own can neither satisfy nor be blamed for.

**This is a floor, not a certificate.** axe catches mechanical failures: a
control with no accessible name, a broken ARIA relationship, a role used
wrongly. It cannot tell you whether focus lands somewhere sensible or whether a
keyboard user can finish a task. The hand-written cases alongside it cover the
parts of that which matter most here; a full audit still needs a person with a
screen reader.

## Node versions

`package.json` claims `engines: >=18`, but CI tests only 20 and 22. Node 18 left
security support in April 2025, and this toolchain (Vite 6, Vitest 4) no longer
targets it.

Two honest options, and this repo has picked neither yet:

- Lower the claim to `>=20`, which is a breaking change for anyone still on 18.
- Add 18 to the CI matrix and keep supporting it.

Claiming support for something nothing tests is the one option worth avoiding.

## Tests

`src/**/__tests__/*.{test,spec}.{js,jsx}`, run by Vitest with jsdom and
Testing Library.

Test what a person can observe — the rendered output, what happens after a
click — rather than internal state. A test that reaches into implementation
fails when the implementation is tidied and passes when the behaviour breaks,
which is exactly backwards.

Where a test exists because something once went wrong, say so in the test. The
next person needs to know it is load-bearing and not a candidate for tidying
away.

## Publishing

`prepublishOnly` runs the build and `verify:package`. Note that it does **not**
run the tarball check, because that would pack a tarball while packing a
tarball — CI covers it instead, which is why publishing from a green commit
matters.
