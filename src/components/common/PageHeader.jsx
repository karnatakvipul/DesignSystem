import { cn } from "../../lib/cn";

/**
 * The title block every list/detail screen opens with: a dominant page
 * title, an optional one-line description under it, and a primary-action
 * slot pinned to the trailing edge — the association between "Users" and
 * "+ Add user" is spatial, not just proximity inside a toolbar.
 *
 * Distinct from `Panel`'s `title`, which is a small card-header for content
 * *inside* a bordered surface. This sits above any surface, at page level,
 * and uses `text-display` — the type scale's dedicated "page heading" step —
 * rather than a size picked to look right in one place.
 */
function PageHeader({ title, description, actions, className }) {
  return (
    <div className={cn("flex flex-wrap items-start justify-between gap-4", className)}>
      <div className="min-w-0">
        <h1 className="font-secondary text-display font-bold text-ink-primary">{title}</h1>
        {description && <p className="mt-1 text-body-sm text-ink-secondary">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

export { PageHeader };

