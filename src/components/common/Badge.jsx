import { cn } from "../../lib/cn";
const toneClasses = {
  neutral: "bg-tag text-tag border border-tag-border",
  online: "bg-status-online-bg text-status-online",
  warn: "bg-status-warn-bg text-status-warn",
  offline: "bg-status-offline-bg text-status-offline",
  live: "bg-live-bg text-live-text",
  accent: "bg-accent-muted text-accent"
};
/**
 * Corner radius, as a prop rather than something to override with a class.
 *
 * `cn` is plain `clsx` with no tailwind-merge, so passing `rounded-control`
 * through `className` would not replace the default `rounded-pill` — both
 * would land in `class` and the stylesheet's own order would pick the winner.
 * Choosing between whole values here keeps that from being a coin toss.
 *
 * `pill` is the default and what a status badge wants. `control` is the
 * radius the scale gives buttons, inputs and tags — the right step for a
 * badge carrying a figure rather than a state, where a fully-rounded chip
 * reads as softer than the number deserves.
 */
const shapeClasses = {
  pill: "rounded-pill",
  control: "rounded-control"
};
function Badge({ tone = "neutral", shape = "pill", className, children, ...props }) {
  return <span
    className={cn(
      "inline-flex items-center gap-1 px-2 py-0.5 text-body-sm font-medium",
      shapeClasses[shape] ?? shapeClasses.pill,
      toneClasses[tone],
      className
    )}
    {...props}
  >
      {children}
    </span>;
}
export {
  Badge
};
