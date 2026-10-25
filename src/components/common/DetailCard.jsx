import * as React from "react";
import { cn } from "../../lib/cn";

/** The banner a detail page opens with: a large icon avatar, name, status, and actions. */
export function ProfileHeader({
  icon,
  title,
  tag,
  status,
  meta,
  actions,
  className,
}) {
  return (
    <div className={cn("rounded-control border border-card-border bg-card p-5 shadow-raised", className)}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-[18rem] flex-1 items-center gap-4">
          <div
            className={cn(
              "flex shrink-0 items-center justify-center rounded-control bg-accent-muted text-accent",
              tag || meta ? "h-14 w-14" : "h-11 w-11"
            )}
          >
            {icon}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-secondary text-title font-bold text-ink-primary">{title}</h1>
              {status}
            </div>
            {tag && <div className="mt-1">{tag}</div>}
            {meta && <div className="mt-1 text-body-sm text-ink-secondary">{meta}</div>}
          </div>
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}

/**
  Facts in two columns, pairing labels with their values.
 */
export function InfoGrid({ children, className }) {
  return (
    <div className={cn("grid gap-x-8 sm:grid-cols-2 sm:[&>*]:border-b-0", className)}>{children}</div>
  );
}

export function InfoRow({
  label,
  value,
  wide = false,
  className,
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-0.5 border-b border-card-border py-2.5 sm:flex-row sm:items-baseline sm:gap-4",
        wide && "sm:col-span-2",
        className
      )}
    >
      <div className="w-32 shrink-0 text-body-sm text-ink-secondary">{label}</div>
      <div className="min-w-0 text-body-sm text-ink-primary">
        {value === undefined || value === null || value === "" ? "—" : value}
      </div>
    </div>
  );
}
