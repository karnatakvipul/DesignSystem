import * as React from "react";
import { Tooltip } from "./Tooltip";
import { cn } from "../../lib/cn";

/**
 * Reusable component for truncating long text strings with ellipses (...) and hover tooltips.
 *
 * Props:
 * - text: String to display and truncate (or children).
 * - maxLength: Optional character limit. If specified, string is hard-truncated to maxLength + "...".
 * - showTooltip: Whether to show hover tooltip with 100% full text (default true).
 * - tooltipPosition: "top" | "bottom" | "left" | "right" (default "top").
 * - className: Additional CSS classes.
 * - as: HTML tag / component wrapper (default "span").
 */
export function TruncatedText({
  text,
  children,
  maxLength,
  showTooltip = true,
  tooltipPosition = "top",
  className,
  as: Component = "span",
  ...props
}) {
  const contentString =
    text !== undefined && text !== null
      ? String(text)
      : typeof children === "string" || typeof children === "number"
      ? String(children)
      : "";

  // Hard truncation by character count if maxLength is specified.
  // Use Array.from so multi-byte code points (emoji, etc.) aren't sliced
  // in half, which would render as a broken/garbled character.
  const codePoints = maxLength ? Array.from(contentString) : null;
  const isHardTruncated = Boolean(maxLength && codePoints.length > maxLength);
  const displayText = isHardTruncated
    ? `${codePoints.slice(0, maxLength).join("")}...`
    : children ?? contentString;

  // No native `title` attribute here when the floating <Tooltip> is active —
  // browsers render their own OS-styled tooltip for `title`, which would show
  // up stacked on top of the themed <Tooltip> below (two overlapping tooltips
  // for the same text). The floating <Tooltip> is the single source of truth
  // for the hover affordance; `title` is only used as a fallback when the
  // caller explicitly opts out of it via `showTooltip={false}`.
  const textElement = (
    <Component
      className={cn("truncate block max-w-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap", className)}
      title={!showTooltip && isHardTruncated ? contentString : undefined}
      {...props}
    >
      {displayText}
    </Component>
  );

  if (!showTooltip || !contentString) {
    return textElement;
  }

  // Always show on hover rather than gating on Tooltip's `onlyIfOverflow`
  // (a runtime scrollWidth/clientWidth measurement). Inside DataTable's
  // fixed-layout cells that measurement can come back false even when the
  // text is visibly ellipsis-clipped — e.g. when this element sits inside
  // nested flex/inline-flex wrappers rather than a plain block box — which
  // silently suppressed the tooltip. Showing unconditionally trades away a
  // minor nicety (skipping the tooltip for text that isn't truncated) for a
  // guarantee that truncated text is always reachable on hover.
  return (
    <Tooltip content={contentString} position={tooltipPosition}>
      {textElement}
    </Tooltip>
  );
}

export { TruncatedText as EllipsisText, TruncatedText as Ellipsis };
