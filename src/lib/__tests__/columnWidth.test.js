import { describe, it, expect } from "vitest";
import {
  COLUMN_SIZES,
  DEFAULT_COLUMN_WIDTH,
  snapColumnWidth,
  resolveColumnWidth,
} from "../columnWidth";

describe("snapColumnWidth", () => {
  it("rounds up to the next step so a column never ends up narrower than asked", () => {
    expect(snapColumnWidth(200)).toBe(224);
    expect(snapColumnWidth(129)).toBe(160);
  });

  it("leaves a value already on the scale alone", () => {
    expect(snapColumnWidth(192)).toBe(192);
  });

  it("clamps at both ends", () => {
    expect(snapColumnWidth(10)).toBe(96);
    expect(snapColumnWidth(9999)).toBe(384);
  });

  it("reads pixel strings", () => {
    expect(snapColumnWidth("200px")).toBe(224);
  });

  it("leaves percentages alone — they are a share, not a pixel count", () => {
    expect(snapColumnWidth("30%")).toBeNull();
  });

  it("returns null for anything unusable, so callers can fall through", () => {
    expect(snapColumnWidth(undefined)).toBeNull();
    expect(snapColumnWidth(null)).toBeNull();
    expect(snapColumnWidth("auto")).toBeNull();
    expect(snapColumnWidth(0)).toBeNull();
    expect(snapColumnWidth(-50)).toBeNull();
  });
});

describe("resolveColumnWidth", () => {
  it("prefers a named size", () => {
    expect(resolveColumnWidth({ size: "lg", width: 100, minWidth: 90 })).toBe(COLUMN_SIZES.lg);
  });

  it("falls back to an explicit width, snapped", () => {
    expect(resolveColumnWidth({ width: 200, minWidth: 90 })).toBe(224);
  });

  it("treats minWidth as a floor when nothing else is given", () => {
    expect(resolveColumnWidth({ minWidth: 220 })).toBe(224);
  });

  it("uses the default when a column expresses no preference", () => {
    expect(resolveColumnWidth({ key: "anything" })).toBe(DEFAULT_COLUMN_WIDTH);
    expect(resolveColumnWidth(null)).toBe(DEFAULT_COLUMN_WIDTH);
  });

  it("ignores a size that is not on the scale rather than returning undefined", () => {
    expect(resolveColumnWidth({ size: "enormous", minWidth: 220 })).toBe(224);
  });

  it("puts every named size on the same step grid", () => {
    for (const width of Object.values(COLUMN_SIZES)) {
      expect(width % 32).toBe(0);
    }
  });
});
