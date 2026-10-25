import * as React from "react";

function toPoints(values, max, w, h) {
  return values.map((v, i) => {
    const x = (i / (values.length - 1 || 1)) * w;
    const y = h - (v / max) * h;
    return `${x},${y}`;
  }).join(" ");
}

/** Charts for the total license trend and the account-wise trend. */
export function LicenseTrendChart({ data = [] }) {
  const w = 400;
  const h = 140;
  const points = data.map((d) => ({
    total: Number(d?.total) || 0,
    accountWise: Number(d?.accountWise) || 0,
    label: d?.label ?? "",
  }));
  const max = Math.max(1, ...points.map((d) => d.total));
  const totalPoints = toPoints(points.map((d) => d.total), max, w, h);
  const accountPoints = toPoints(points.map((d) => d.accountWise), max, w, h);

  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="none">
        <polyline points={totalPoints} fill="none" stroke="var(--accent-primary)" strokeWidth="2" />
        <polyline points={accountPoints} fill="none" stroke="var(--accent-light)" strokeWidth="2" strokeDasharray="4 3" />
      </svg>
      <div className="mt-2 flex justify-between text-body-sm text-ink-muted">
        {points.map((d, i) => (
          <span key={`${d.label}-${i}`}>{d.label}</span>
        ))}
      </div>
      <div className="mt-2 flex gap-4 text-body-sm">
        <span className="flex items-center gap-1 text-ink-secondary"><span className="h-2 w-2 rounded-pill bg-accent" /> Total license</span>
        <span className="flex items-center gap-1 text-ink-secondary"><span className="h-2 w-2 rounded-pill bg-accent-light" /> Account-wise</span>
      </div>
    </div>
  );
}
