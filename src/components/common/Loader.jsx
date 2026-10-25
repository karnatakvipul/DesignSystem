import { cn } from "../../lib/cn";
function Loader({ fullPage, label = "Fetching the records...", className }) {
  const spinner = <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
      <span className="h-10 w-10 animate-spin rounded-pill border-4 border-accent-muted border-t-accent" />
      {label && <span className="text-body text-ink-secondary">{label}</span>}
    </div>;
  if (!fullPage) return spinner;
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-canvas/70 backdrop-blur-sm">
      {spinner}
    </div>;
}
export {
  Loader
};
