import * as React from "react";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "../../lib/cn";

function Breadcrumbs({
  items = [],
  separator = <ChevronRight size={14} className="text-ink-muted shrink-0" />,
  showHomeIcon = true,
  className
}) {
  if (!items || items.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center gap-1.5 text-body-sm text-ink-secondary flex-wrap min-w-0 select-none", className)}
    >
      {showHomeIcon && (
        <span className="flex items-center text-ink-muted hover:text-ink-primary transition-colors">
          <Home size={14} />
        </span>
      )}
      {showHomeIcon && items.length > 0 && separator}

      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <React.Fragment key={item.key || item.label || index}>
            <div className="flex items-center gap-1 min-w-0">
              {item.icon && <span className="shrink-0">{item.icon}</span>}
              {isLast ? (
                <span aria-current="page" className="font-semibold text-ink-primary truncate">
                  {item.label}
                </span>
              ) : item.href ? (
                <a
                  href={item.href}
                  onClick={item.onClick}
                  className="hover:text-accent font-medium transition-colors truncate"
                >
                  {item.label}
                </a>
              ) : (
                <button
                  type="button"
                  onClick={item.onClick}
                  className="hover:text-accent font-medium transition-colors truncate cursor-pointer"
                >
                  {item.label}
                </button>
              )}
            </div>
            {!isLast && separator}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

export { Breadcrumbs };
