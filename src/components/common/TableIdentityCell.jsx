import * as React from "react";
import { ExternalLink } from "lucide-react";
import { cn } from "../../lib/cn";

/**
 * How a record names itself in the leading column of a table.
 * Supports optional brand logo and external navigation links.
 */
export function TableIdentityCell({
  name,
  logo,
  href,
  external = false,
  className,
}) {
  const content = (
    <div className={cn("flex items-center gap-2.5 min-w-0", className)}>
      {logo && (
        <div
          className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-control bg-tag/60 border border-card-border p-0.5 group-hover:border-accent/40"
          aria-hidden
        >
          <img src={logo} alt="" className="h-full w-full object-contain" />
        </div>
      )}
      <div className="min-w-0 truncate text-body font-medium leading-5 text-ink-primary group-hover:text-accent" title={name}>
        {name}
      </div>
      {external && (
        <ExternalLink size={12} className="shrink-0 text-ink-muted/50 transition-colors group-hover:text-accent" aria-hidden />
      )}
    </div>
  );

  if (href && external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="group inline-flex items-center min-w-0 max-w-full cursor-pointer hover:underline underline-offset-2"
        title={`Open ${name} (${href})`}
      >
        {content}
      </a>
    );
  }

  if (href) {
    return (
      <a href={href} className="group inline-flex items-center min-w-0 max-w-full cursor-pointer">
        {content}
      </a>
    );
  }

  return content;
}

