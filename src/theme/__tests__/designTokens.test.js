import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join, resolve, sep } from "node:path";

/**
 * Guards the token layer.
 *
 * A design system is only a design system while everything goes through the
 * tokens. Nothing stops a component reaching past them — `rounded-lg` is
 * shorter to type than `rounded-surface` and looks fine on its own screen — and
 * that is precisely how this codebase ended up with four radii in almost equal
 * use, six shadows, and around sixty ad-hoc pixel values, none of them wrong
 * individually and no two agreeing.
 *
 * Two layers of guard. The primitives that define the visual language are held
 * strictly. Everything else is held by an exemption list that only shrinks, so a
 * new component is governed the day it is written rather than the day somebody
 * remembers to add it.
 */

const SRC = resolve(__dirname, "../..");
const COMMON = join(SRC, "components/common");

/**
 * Files still allowed to hold a raw radius or shadow.
 *
 * An exemption list rather than a list of governed files, so a new component is
 * governed the day it is written. Nobody has to remember to add it, and
 * forgetting fails loudly instead of quietly opting out.
 *
 * **This list only shrinks.** Everything on it holds one of the values that has
 * no equal on the scale — `rounded-md` is 6px against the scale's 8px, and no
 * shadow matches any token. Migrating those changes what renders, so each one
 * is a decision to take deliberately rather than a swap to apply in bulk.
 */
const NOT_YET_ON_THE_SCALE = new Set([
  "App.jsx",
  "components/common/AsyncDropdown.jsx",
  "components/common/AsyncMultiSelectDropdown.jsx",
  "components/common/BottomSheet.jsx",
  "components/common/Card.jsx",
  "components/common/chartTheme.jsx",
  "components/common/ColumnFilterDropdown.jsx",
  "components/common/CopyButton.jsx",
  "components/common/DatePicker.jsx",
  "components/common/DateRangePicker.jsx",
  "components/common/DonutChart.jsx",
  "components/common/Dropdown.jsx",
  "components/common/ErrorBoundary.jsx",
  "components/common/FilterField.jsx",
  "components/common/FloatingAddButton.jsx",
  "components/common/InputGroup.jsx",
  "components/common/MobileCardList.jsx",
  "components/common/MultiSelectDropdown.jsx",
  "components/common/SearchBox.jsx",
  "components/common/SegmentedControl.jsx",
  "components/common/ServerDataTable.jsx",
  "components/common/Skeleton.jsx",
  "components/common/SkeletonCard.jsx",
  "components/common/SkeletonTable.jsx",
  "components/common/SlideOverModal.jsx",
  "components/common/Timeline.jsx",
  "components/common/Toast.jsx",
  "components/common/ToggleButtonGroup.jsx",
  "components/common/Tooltip.jsx",
  "components/feature/InvoicePreviewModal.jsx",
  "components/feature/license/LicenseToolbar.jsx",
  "components/feature/LicenseAgentButton.jsx",
  "components/feature/ReportWidget.jsx",
  "components/layout/AuthLayout.jsx",
  "components/layout/ProfileMenu.jsx",
  "components/layout/Sidebar.jsx",
  "pages/LicensePage.jsx",
  "pages/ServerSidePage.jsx",
  "theme/ThemeSwitcher.jsx",
]);

/** The primitives that define the visual language, checked most strictly. */
const GOVERNED = [
  "Button.jsx",
  "Badge.jsx",
  "Panel.jsx",
  "Modal.jsx",
  "DataTable.jsx",
  "FilterPanel.jsx",
  "ContextMenu.jsx",
];

function read(file) {
  return readFileSync(join(COMMON, file), "utf8");
}

/** Every shipped source file, as repo-relative paths. */
function sourceFiles(dir = SRC, found = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "__tests__" || entry.name === "test") continue;
      sourceFiles(full, found);
    } else if (entry.name.endsWith(".jsx")) {
      found.push(full);
    }
  }
  return found;
}

/** Class names in the source, ignoring `md:`-style variant prefixes. */
function classNames(source) {
  return [...source.matchAll(/[\w-]+/g)].map((m) => m[0]);
}

describe("the tokens are declared", () => {
  const themeCss = readFileSync(resolve(__dirname, "../../theme.css"), "utf8");

  it.each([
    ["--radius-control"],
    ["--radius-surface"],
    ["--radius-overlay"],
    ["--radius-pill"],
    ["--spacing-control-sm"],
    ["--spacing-control-md"],
    ["--spacing-control-lg"],
    ["--text-caption"],
    ["--text-body-sm"],
    ["--text-body"],
    ["--text-title"],
    ["--text-display"],
    ["--shadow-raised"],
    ["--shadow-floating"],
    ["--shadow-overlay"],
    ["--ease-standard"],
  ])("%s", (token) => {
    expect(themeCss).toContain(`${token}:`);
  });

  it("declares control heights under a namespace Tailwind generates from", () => {
    // `--size-*` looks like it should work and produces nothing: the utilities
    // silently do not exist and the element renders at its content height.
    expect(themeCss).toContain("--spacing-control-md:");
    expect(themeCss).not.toContain("--size-control-md:");
  });

  it("keeps durations and z-index out of @theme, where they would generate nothing", () => {
    // The block only, not everything after it — `:root` follows, and that is
    // exactly where these two are supposed to live.
    const start = themeCss.indexOf("@theme {");
    const themeBlock = themeCss.slice(start, themeCss.indexOf("\n}", start));

    expect(themeBlock).not.toContain("--duration-fast:");
    expect(themeBlock).not.toContain("--z-overlay:");
    expect(themeCss).toContain("--duration-fast:");
    expect(themeCss).toContain("--z-overlay:");
  });
});

describe("the governed primitives use them", () => {
  it.each(GOVERNED)("%s picks its radius from the scale", (file) => {
    const raw = ["rounded-md", "rounded-lg", "rounded-xl", "rounded-2xl", "rounded-3xl", "rounded-full"];
    const used = classNames(read(file)).filter((c) => raw.includes(c));

    expect(used, `${file} should use rounded-control/surface/overlay/pill`).toEqual([]);
  });

  it.each(GOVERNED)("%s picks its elevation from the scale", (file) => {
    const raw = ["shadow-sm", "shadow-md", "shadow-lg", "shadow-xl", "shadow-2xl"];
    const used = classNames(read(file)).filter((c) => raw.includes(c));

    expect(used, `${file} should use shadow-raised/floating/overlay`).toEqual([]);
  });

  it("Button takes its heights from the control scale", () => {
    // Where the drift was worst: h-9/h-10/h-11/h-12 across three sizes, none of
    // which lined up with the inputs beside them.
    const source = read("Button.jsx");
    expect(source).toMatch(/h-control-(sm|md|lg)/);

    // Only the size classes. `h-4 w-4` on the spinner is an icon, not a
    // control, and squaring an icon against the control scale would make it
    // the height of the button containing it.
    const sizeClasses = source.slice(source.indexOf("sizes"), source.indexOf("};"));
    expect(classNames(sizeClasses).filter((c) => /^h-\d+$/.test(c))).toEqual([]);
  });
});

describe("no component invents a value the scale already has", () => {
  it("declares no ad-hoc pixel radius or font size", () => {
    // Arbitrary values are legitimate for one-off layout — a max-width, a
    // viewport clamp. They are not legitimate for the things the scale covers,
    // because that is how a second scale gets started.
    //
    // A literal is the problem, not the bracket syntax. `text-[var(--accent)]`
    // is reaching for a token through a different door and stays within the
    // system; `text-[11px]` invents a size the scale already has a name for.
    const offenders = [];

    for (const file of GOVERNED) {
      const source = read(file);
      for (const match of source.matchAll(/\b(rounded|text|shadow)-\[([^\]]+)\]/g)) {
        const value = match[2];
        if (value.includes("var(--")) continue;
        offenders.push(`${file}: ${match[0]}`);
      }
    }

    expect(offenders).toEqual([]);
  });
});

describe("the whole library, minus a shrinking exemption list", () => {
  const RAW = [
    "rounded-sm", "rounded-md", "rounded-lg", "rounded-xl", "rounded-2xl", "rounded-3xl", "rounded-full",
    "shadow-sm", "shadow-md", "shadow-lg", "shadow-xl", "shadow-2xl",
  ];

  it("has no unexempted file holding a raw radius or shadow", () => {
    const offenders = [];

    for (const file of sourceFiles()) {
      const rel = file.slice(SRC.length + 1).split(sep).join("/");
      if (NOT_YET_ON_THE_SCALE.has(rel)) continue;

      const used = classNames(readFileSync(file, "utf8")).filter((c) => RAW.includes(c));
      if (used.length) offenders.push(`${rel}: ${[...new Set(used)].join(", ")}`);
    }

    expect(offenders).toEqual([]);
  });

  it("exempts nothing that no longer needs it", () => {
    // The list is a ratchet. A file that has been migrated but left on it is a
    // hole nobody can see — it silently stops being checked.
    const stale = [];

    for (const rel of NOT_YET_ON_THE_SCALE) {
      const file = join(SRC, rel);
      const used = classNames(readFileSync(file, "utf8")).filter((c) => RAW.includes(c));
      if (used.length === 0) stale.push(rel);
    }

    expect(stale, "these are clean now and should come off the exemption list").toEqual([]);
  });
});

describe("every theme still carries every colour token", () => {
  it("has no theme missing a token another one defines", () => {
    // A missing colour token renders as an unset CSS variable — an invisible
    // control on that theme alone, and only that theme.
    const tokens = readFileSync(resolve(__dirname, "../tokens.js"), "utf8");
    const themes = [...tokens.matchAll(/"([a-z-]+)":\s*\{([\s\S]*?)\n {2}\},/g)];

    expect(themes.length).toBeGreaterThan(0);

    const keysPerTheme = themes.map(([, name, body]) => ({
      name,
      keys: new Set([...body.matchAll(/^\s{4}(\w+):/gm)].map((m) => m[1])),
    }));

    const everyKey = new Set(keysPerTheme.flatMap((t) => [...t.keys]));

    for (const theme of keysPerTheme) {
      const missing = [...everyKey].filter((key) => !theme.keys.has(key));
      expect(missing, `${theme.name} is missing ${missing.join(", ")}`).toEqual([]);
    }
  });
});
