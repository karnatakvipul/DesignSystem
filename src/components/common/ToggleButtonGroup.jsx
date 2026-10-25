import { cn } from "../../lib/cn";
function ToggleButtonGroup({ options, value, onChange, className }) {
  return <div className={cn("inline-flex overflow-hidden rounded-md border border-card-border", className)} role="tablist">
      {options.map((opt, i) => {
    const active = opt.value === value;
    return <button
      key={opt.value}
      type="button"
      role="tab"
      aria-selected={active}
      onClick={() => onChange(opt.value)}
      className={cn(
        "h-9 px-4 text-body font-medium transition-colors",
        i === 0 ? "border-r border-card-border" : "",
        active ? "bg-accent text-white" : "bg-input text-ink-secondary hover:bg-accent-muted"
      )}
    >
            {opt.label}
          </button>;
  })}
    </div>;
}
export {
  ToggleButtonGroup
};
