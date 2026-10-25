import * as React from "react";
import { cn } from "../../lib/cn";

/**
 * The forms' field grid: two columns once there is room, one below that.
 */
export function FieldGrid({ children, className }) {
  return <div className={cn("grid gap-4 sm:grid-cols-2", className)}>{children}</div>;
}

/**
 * A field that should keep the full width of the grid — descriptions, URLs,
 * address lines, anything whose content is genuinely long.
 */
export function FieldFull({ children, className }) {
  return <div className={cn("sm:col-span-2", className)}>{children}</div>;
}

/**
 * Caps for fields whose content has a known, short shape.
 */
export const FIELD_WIDTH = {
  short: "max-w-40",
  medium: "max-w-72",
};
