import * as React from "react";
import { CheckCircle2, XCircle, AlertTriangle, MinusCircle, HelpCircle, Clock } from "lucide-react";
import { cn } from "../../../lib/cn";
import { Tooltip } from "../../common/Tooltip";
import {
  getLicenseLifecycle,
  getExpiryUrgency,
  describeExpiry,
  DEFAULT_WARN_WITHIN_DAYS,
} from "../../../lib/licenseExpiry";

/**
 * How each lifecycle state looks. The icon carries the meaning as much as the
 * colour does, so the states stay distinguishable to anyone who does not see
 * red and green as different — colour alone would make "Active" and "Expired"
 * identical for them.
 */
const BY_STATE = {
  active: { Icon: CheckCircle2, className: "text-status-online" },
  expired: { Icon: XCircle, className: "text-status-offline" },
  // Greyed rather than coloured: a licence someone switched off on purpose is
  // not a problem to be flagged, and giving it a status colour would put it in
  // competition with the rows that do need attention.
  //
  // Secondary rather than muted, though — muted measures 2.56:1 on the light
  // theme's card, which is a label you have to lean in to read.
  deactivated: { Icon: MinusCircle, className: "text-ink-secondary" },
  unknown: { Icon: HelpCircle, className: "text-ink-secondary" },
};

/**
 * `expiring` alone would paint every licence inside the warning window the
 * same amber, which answers "does this need attention" but not "how badly" —
 * the question someone opening this table actually has. Graded here instead,
 * escalating within one colour family rather than each level taking a colour
 * of its own: a table of unrelated hues is a puzzle to decode, where one hue
 * getting stronger is read at a glance. `critical` is the exception — it
 * crosses into the expired colour, because a licence going today is the same
 * job as one already gone.
 *
 * `low` swaps the warning triangle for a clock. Three weeks out is a date to
 * note, not an alarm, and a table full of triangles teaches people to ignore
 * triangles.
 */
const BY_URGENCY = {
  critical: { Icon: AlertTriangle, className: "text-status-offline" },
  high: { Icon: AlertTriangle, className: "text-status-warn" },
  medium: { Icon: AlertTriangle, className: "text-status-warn/85" },
  low: { Icon: Clock, className: "text-ink-secondary" },
};

/**
 * The STATUS cell of the licence table.
 *
 * Shows where the licence stands rather than just what is stored against it:
 * a live licence inside its warning window reads "About to expire in 6 days"
 * instead of a bare "Active", which is the difference between a column you
 * scan past and one that tells you what to do next.
 *
 * The countdown is the headline because it is the number people act on. The
 * exact date is a hover away rather than in the cell — putting both in would
 * make the column twice as wide for information that only matters once you
 * have decided a row is worth your attention.
 *
 * Pair with `getRowTone` on the table to tint the whole row; see `LicensePage`.
 */
export function LicenseStatusCell({
  row,
  warnWithinDays = DEFAULT_WARN_WITHIN_DAYS,
  now,
  showTooltip = true,
  className,
}) {
  const options = React.useMemo(
    () => ({ warnWithinDays, ...(now ? { now } : {}) }),
    [warnWithinDays, now]
  );

  const { state, label } = getLicenseLifecycle(row, options);
  // Only an expiring licence is graded; every other state has one look.
  const { Icon, className: toneClassName } =
    (state === "expiring" ? BY_URGENCY[getExpiryUrgency(row, options)] : null) ??
    BY_STATE[state] ??
    BY_STATE.unknown;

  const content = (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-body-sm font-semibold whitespace-nowrap",
        toneClassName,
        className
      )}
    >
      <Icon size={15} className="shrink-0" aria-hidden="true" />
      <span>{label}</span>
    </span>
  );

  if (!showTooltip) return content;

  return (
    <Tooltip content={describeExpiry(row, options)} position="top">
      {content}
    </Tooltip>
  );
}

/**
 * The row tint that goes with the cell above.
 *
 * Only rows needing action are tinted. Tinting expired rows too would leave
 * most of the table coloured on a mature account, and a highlight that covers
 * everything highlights nothing.
 */
export function getLicenseRowTone(row, options) {
  return getLicenseLifecycle(row, options).state === "expiring" ? "warn" : null;
}
