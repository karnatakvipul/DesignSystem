import * as React from "react";
import { cn } from "../../lib/cn";

/**
 * Two-pane shell for the Add/Edit screens: the form on the left, a sticky
 * live-preview card on the right. Collapses to a single column below xl.
 */
export function FormLayout({ form, preview, className }) {
  return (
    <div className={cn("grid items-start gap-4 xl:grid-cols-form", className)}>
      <div className="min-w-0">{form}</div>
      <div className="xl:sticky xl:top-4">{preview}</div>
    </div>
  );
}

export function PreviewPanel({
  icon,
  eyebrow,
  title,
  subtitle,
  rows = [],
  className,
}) {
  return (
    <div className={cn("rounded-control border border-card-border bg-card shadow-raised", className)}>
      <div className="flex flex-col items-center gap-3 border-b border-card-border px-5 py-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-control bg-accent-muted text-accent">{icon}</div>
        <div>
          {eyebrow && <div className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{eyebrow}</div>}
          {title && <div className="mt-1 font-secondary text-body font-bold text-ink-primary">{title}</div>}
          {subtitle && <div className="mt-0.5 text-body-sm text-ink-secondary">{subtitle}</div>}
        </div>
      </div>
      <div className="flex flex-col gap-2.5 px-5 py-4">
        {rows.map((row) => (
          <div key={row.label} className="flex items-start justify-between gap-3 text-body-sm">
            <span className="text-ink-muted">{row.label}</span>
            <span className="min-w-0 truncate text-right font-medium text-ink-primary">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
