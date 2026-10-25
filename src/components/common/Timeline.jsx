import * as React from "react";
import { Clock, FilePlus2, PencilLine, Trash2, Receipt, Dot, Ticket } from "lucide-react";
import { cn } from "../../lib/cn";

/**
 * Reusable, Theme-Aware Audit Timeline Component.
 * Fits seamlessly into any dark/light theme design system.
 *
 * Props:
 * - items: Array of timeline entry objects:
 *   [
 *     {
 *       date: "03-JUL-26",
 *       time: "14:16",
 *       relative: "3 months ago",       // optional, shown under the time
 *       title: "Activate License",
 *       kind: "changed",                // optional: created | changed | deleted | document | note
 *       description: "prose sentence",  // optional, shown instead of a diff table
 *       changes: [
 *         { label: "Status", before: "Deactivate (0000000000)", after: "Activate" }
 *       ],
 *       // A single change works too, singular:
 *       change: { label: "Status", before: "...", after: "...", reason: "TCK-1" },
 *       // Or simplified before/after strings, with no field label:
 *       before: "Deactivate (0000000000)",
 *       after: "Activate"
 *     }
 *   ]
 *
 * `kind` grades the event with an icon and a ring colour, so a long history
 * reads down its spine without opening a single card. Left off, the node
 * falls back to a plain accent dot — the original look, unchanged for any
 * caller that doesn't pass it.
 */
const KIND_PRESENTATION = {
  created: { Icon: FilePlus2, ring: "border-status-online", fill: "text-status-online" },
  changed: { Icon: PencilLine, ring: "border-status-warn", fill: "text-status-warn" },
  deleted: { Icon: Trash2, ring: "border-status-offline", fill: "text-status-offline" },
  document: { Icon: Receipt, ring: "border-accent", fill: "text-accent" },
  note: { Icon: Dot, ring: "border-card-border", fill: "text-ink-secondary" },
};

/** Reads whichever of `changes` / `change` / `before`+`after` an entry carries. */
function toChangesList(item) {
  if (Array.isArray(item.changes)) return item.changes;
  if (item.change) return [item.change];
  if (item.before !== undefined || item.after !== undefined) {
    return [{ before: item.before ?? "-", after: item.after ?? "-" }];
  }
  return [];
}

/** The reason/ticket a change was made under, wherever the caller put it. */
function toReason(item, changesList) {
  return item.reason ?? changesList[0]?.reason ?? null;
}

function Timeline({ items = [], className }) {
  if (!items || items.length === 0) {
    return (
      <div className="py-8 text-center text-body-sm text-ink-muted">
        No timeline history available.
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-6 py-2 px-1 max-w-full overflow-x-hidden", className)}>
      {items.map((item, idx) => {
        const changesList = toChangesList(item);
        const reason = toReason(item, changesList);
        const { Icon, ring, fill } = KIND_PRESENTATION[item.kind] ?? null ?? {};

        return (
          <div key={item.id || idx} className="relative flex items-start gap-3 sm:gap-4 group">
            {/* 1. Left Date & Time Label */}
            <div className="w-24 sm:w-28 shrink-0 text-right pt-1.5 flex flex-col items-end">
              <span className="font-mono text-caption sm:text-xs font-semibold text-ink-primary tracking-tight">
                {item.date}
              </span>
              {item.time && (
                <div className="flex items-center gap-1 text-[10px] sm:text-xs text-ink-muted mt-0.5">
                  <span>{item.time}</span>
                  <Clock size={11} className="shrink-0" />
                </div>
              )}
              {/* "3 months ago" is the part people actually want from a
                  timestamp; the exact date stays above it for when they don't. */}
              {item.relative && (
                <span className="mt-0.5 text-[10px] sm:text-xs text-ink-muted/80">{item.relative}</span>
              )}
            </div>

            {/* 2. Middle Vertical Axis Line & Node */}
            <div className="relative flex flex-col items-center self-stretch shrink-0">
              {idx > 0 && <div className="w-0.5 bg-accent/40 flex-1 min-h-[12px]" />}

              {Icon ? (
                <div
                  className={cn(
                    "relative z-10 flex h-7 w-7 items-center justify-center rounded-pill border-2 bg-card shadow-sm transition-transform duration-200 group-hover:scale-110",
                    ring
                  )}
                >
                  <Icon size={14} className={cn("shrink-0", fill)} aria-hidden="true" />
                </div>
              ) : (
                <div className="relative z-10 flex h-5 w-5 items-center justify-center rounded-pill border-2 border-accent bg-card shadow-sm transition-transform duration-200 group-hover:scale-110">
                  <div className="h-2 w-2 rounded-pill bg-accent" />
                </div>
              )}

              {idx < items.length - 1 && <div className="w-0.5 bg-accent/40 flex-1 min-h-[12px]" />}
            </div>

            {/* 3. Right Callout Arrow & Audit Card */}
            <div className="relative flex-1 min-w-0 pt-0.5">
              <div
                className="absolute -left-2 top-3 h-0 w-0 border-y-[6px] border-y-transparent border-r-[8px] border-r-card-border"
                aria-hidden="true"
              />
              <div
                className="absolute -left-[7px] top-[13px] h-0 w-0 border-y-[5px] border-y-transparent border-r-[7px] border-r-card"
                aria-hidden="true"
              />

              <div className="rounded-surface border border-card-border bg-card p-3 sm:p-4 shadow-sm transition-shadow hover:shadow-md">
                <h4 className="font-secondary text-body font-semibold text-ink-primary tracking-tight mb-2.5">
                  {item.title}
                </h4>

                {/* Prose, for events that already read as a sentence — sending
                    an invoice reads perfectly well as one, and forcing it into
                    a before/after table would only obscure it. */}
                {item.description && changesList.length === 0 && (
                  <p className="text-body-sm text-ink-secondary break-words">{item.description}</p>
                )}

                {changesList.length > 0 && (
                  <div className="overflow-hidden rounded-control border border-card-border bg-input/50">
                    <table className="w-full text-left text-body-sm border-collapse">
                      <thead>
                        <tr className="border-b border-card-border bg-card-bg/60 text-ink-secondary font-medium">
                          {changesList[0]?.label && <th className="px-3 py-1.5 font-semibold">Field</th>}
                          <th className="px-3 py-1.5 font-semibold w-1/2">Before</th>
                          <th className="px-3 py-1.5 font-semibold w-1/2">After</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-card-border/60">
                        {changesList.map((change, cIdx) => (
                          <tr key={cIdx} className="hover:bg-card-bg/30 transition-colors">
                            {change.label && (
                              <td className="px-3 py-2 text-ink-muted font-medium truncate max-w-[100px]">
                                {change.label}
                              </td>
                            )}
                            <td className="px-3 py-2 text-ink-primary font-mono text-caption sm:text-xs break-all">
                              {renderFormattedValue(change.before)}
                            </td>
                            <td className="px-3 py-2 text-ink-primary font-mono text-caption sm:text-xs break-all">
                              {renderFormattedValue(change.after)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* The ticket a change was made under. Given its own line it
                    becomes the thing you can actually look up, rather than
                    trailing off the end of a sentence. */}
                {reason && (
                  <div className="mt-2.5 flex items-center gap-1.5 text-caption text-ink-muted">
                    <Ticket size={12} className="shrink-0" aria-hidden="true" />
                    <span>Reason</span>
                    <span className="break-all font-mono text-ink-secondary">{reason}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** The parsed value, or undefined when it is not JSON — `null` is valid JSON. */
function tryParseJson(value) {
  const text = String(value ?? "").trim();
  if (!(text.startsWith("{") || text.startsWith("["))) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

/**
 * Format a diff value: pretty-printed in a scroll box when it's a JSON
 * document (otherwise it is a wall of braces that sets the table's width),
 * highlighted when it carries an activate/deactivate state, plain otherwise.
 */
function renderFormattedValue(value) {
  if (value === undefined || value === null || value === "") {
    return <span className="text-ink-muted italic">-</span>;
  }

  const asJson = tryParseJson(value);
  if (asJson !== undefined) {
    return (
      <pre className="max-h-32 overflow-auto whitespace-pre-wrap break-all rounded-control bg-canvas/60 p-2 text-caption leading-snug text-ink-secondary">
        {JSON.stringify(asJson, null, 2)}
      </pre>
    );
  }

  const str = String(value);

  if (str.includes("Deactivate") || str.includes("0000000000")) {
    return (
      <span className="text-ink-primary">
        {str.split("(0000000000)").map((part, i, arr) => (
          <React.Fragment key={i}>
            {part}
            {i < arr.length - 1 && (
              <span className="font-semibold text-status-offline">(0000000000)</span>
            )}
          </React.Fragment>
        ))}
      </span>
    );
  }

  if (str === "Activate" || str.includes("Active")) {
    return <span className="font-semibold text-status-online">{str}</span>;
  }

  return <span>{str}</span>;
}

export { Timeline };
