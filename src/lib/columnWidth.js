/**
 * A shared scale for table column widths.
 *
 * Column widths used to be free-typed numbers — 90 here, 110 there, 220 on the
 * next page — so no two tables lined up and a single header row read as ragged.
 * Widths now come from a small set of steps instead. Because every column lands
 * on a multiple of `STEP`, headers fall into an even rhythm across the row and
 * across pages, without forcing every column to the same size (a key column
 * still needs more room than a yes/no flag).
 *
 * Two ways to ask for a width:
 *
 *   { key: "term", size: "sm" }     // preferred — a named step
 *   { key: "term", minWidth: 90 }   // snapped up to the nearest step (96)
 *
 * Widths a person drags out by hand are deliberately *not* snapped; see
 * `DataTable`'s resize handler. Snapping mid-drag makes the handle feel like it
 * is fighting the pointer, and a hand-set width is an explicit override of the
 * house style rather than an expression of it.
 */

/** Every width is a multiple of this, which is what produces the even rhythm. */
const STEP = 32;

/** Narrower than this and a header label has nowhere to go. */
const MIN_WIDTH = 96;

/** Wider than this and one column pushes everything else off-screen. */
const MAX_WIDTH = 384;

/**
 * The named steps. Roughly: a flag, a code, a date or amount, an account, a
 * free-text name.
 */
export const COLUMN_SIZES = {
  xs: 96,
  sm: 128,
  md: 192,
  lg: 256,
  xl: 320,
};

/** Used when a column expresses no width preference at all. */
export const DEFAULT_COLUMN_WIDTH = COLUMN_SIZES.sm;

/**
 * Rounds a width up to the next step, then clamps it.
 *
 * Rounds *up* rather than to-nearest so snapping never makes a column narrower
 * than what was asked for — shrinking a declared width is how content starts
 * getting clipped in ways the page author did not expect.
 *
 * Returns `null` for anything that is not a usable pixel value (`undefined`,
 * `"auto"`, `"30%"`), so callers can fall through to their next choice.
 */
export function snapColumnWidth(value) {
  if (value == null) return null;
  const px = typeof value === "number" ? value : Number.parseInt(String(value), 10);
  if (!Number.isFinite(px) || px <= 0) return null;

  // A percentage is a share of the table, not a pixel count — snapping it to a
  // pixel step would quietly change what was asked for, so leave it alone.
  if (typeof value === "string" && value.trim().endsWith("%")) return null;

  const snapped = Math.ceil(px / STEP) * STEP;
  return Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, snapped));
}

/**
 * The width a column should actually render at, in pixels.
 *
 * Order of preference: a named `size`, then an explicit `width`, then
 * `minWidth` as a floor, then the default. The first three all go through the
 * scale so a page cannot accidentally reintroduce a ragged row.
 */
export function resolveColumnWidth(col, fallback = DEFAULT_COLUMN_WIDTH) {
  if (!col) return fallback;

  if (col.size && COLUMN_SIZES[col.size] != null) return COLUMN_SIZES[col.size];

  const explicit = snapColumnWidth(col.width);
  if (explicit != null) return explicit;

  const floor = snapColumnWidth(col.minWidth);
  if (floor != null) return floor;

  return fallback;
}
