import * as React from "react";
import { cn } from "../../lib/cn";

/** A form section's card shell: a title/subtitle header, the fields, and a sticky footer. */
export function FormCard({
  title,
  subtitle,
  children,
  footer,
  className,
}) {
  return (
    <div className={cn("w-full rounded-control border border-card-border bg-card shadow-raised", className)}>
      <div className="border-b border-card-border px-5 py-4">
        <h2 className="font-secondary text-body font-bold text-ink-primary">{title}</h2>
        {subtitle && <p className="mt-1 text-body-sm text-ink-secondary">{subtitle}</p>}
      </div>
      <div className="flex flex-col gap-4 px-5 py-5">{children}</div>
      {footer && (
        <div className="sticky bottom-0 flex items-center justify-end gap-3 rounded-b-control border-t border-card-border bg-card px-5 py-4 shadow-[0_-8px_16px_-12px_rgb(0_0_0/0.22)]">
          {footer}
        </div>
      )}
    </div>
  );
}

/** An all-caps section label with an icon chip. */
export function SectionHeading({ icon, children, className }) {
  return (
    <div className={cn("mt-2 flex items-center gap-2 border-b border-card-border pb-2 first:mt-0", className)}>
      {icon && <span className="text-accent">{icon}</span>}
      <h3 className="text-xs font-bold uppercase tracking-wide text-ink-muted">{children}</h3>
    </div>
  );
}

/** A hint line under a field. */
export function FieldHint({ children, className }) {
  return <p className={cn("text-xs text-ink-muted", className)}>{children}</p>;
}
