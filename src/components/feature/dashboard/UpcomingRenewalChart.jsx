import * as React from "react";

export function UpcomingRenewalChart({ data = [] }) {
  const values = data.map((d) => ({ label: d.label, value: Number(d.value) || 0 }));
  const max = Math.max(1, ...values.map((d) => d.value));
  return (
    <div className="flex h-48 items-end gap-4 px-2">
      {values.map((d) => (
        <div key={d.label} className="flex h-full flex-1 flex-col items-center gap-2">
          <span className="text-body-sm text-ink-secondary">{d.value}</span>
          <div className="flex w-full flex-1 items-end min-h-0">
            <div
              className="w-full rounded-t bg-accent transition-all"
              style={{ height: `${(d.value / max) * 100}%`, minHeight: 4 }}
            />
          </div>
          <span className="text-body-sm text-ink-muted">{d.label}</span>
        </div>
      ))}
    </div>
  );
}
