import { LicenseStatusCell, getLicenseRowTone } from "./LicenseStatusCell";

const today = new Date();
function inDays(n) {
  const d = new Date(today);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

/**
 * The STATUS cell of the licence table.
 *
 * It shows where a licence *stands* rather than what is merely stored against
 * it: a live licence inside its warning window reads "About to expire in 6
 * days" instead of a bare "Active". That is the difference between a column
 * you scan past and one that tells you what to do next.
 *
 * **Icon as well as colour.** Each state carries its own icon, so Active and
 * Expired stay distinguishable to anyone who does not see red and green as
 * different — colour alone would make them identical.
 *
 * **Expiry is graded, not flagged.** A single amber for everything inside the
 * window answers "does this need attention" but not "how badly", which is the
 * question someone opening this table actually has. The grades escalate within
 * one colour family — a table of unrelated hues is a puzzle; one hue getting
 * stronger is read at a glance. `critical` is the exception: it crosses into
 * the expired red, because a licence going today is the same job as one
 * already gone. And `low` swaps the warning triangle for a clock, because
 * three weeks out is a date to note, not an alarm — a table full of triangles
 * teaches people to ignore triangles.
 *
 * `getLicenseRowTone` is the matching row tint. Only rows needing action are
 * tinted: colouring expired rows too would leave most of a mature account's
 * table shaded, and a highlight that covers everything highlights nothing.
 */
const meta = {
  title: "Feature/License/LicenseStatusCell",
  component: LicenseStatusCell,
  tags: ["autodocs"],
  argTypes: {
    row: { control: "object", description: "The licence row — read for its status and expiry." },
    warnWithinDays: {
      control: { type: "number", min: 1 },
      description: "How far ahead a licence starts being flagged as expiring.",
    },
    now: { control: false, description: "Overrides the clock. For tests and fixed-date stories." },
    showTooltip: { control: "boolean", description: "Hover reveals the exact date. Defaults to `true`." },
    className: { control: "text" },
  },
  args: {
    row: { status: "Active", isActive: true, expiry: inDays(6) },
    warnWithinDays: 30,
    showTooltip: true,
  },
};

export default meta;

export const Playground = {};

/** Every lifecycle state, each with its own icon as well as its colour. */
export const AllStates = {
  render: () => (
    <div className="flex flex-col gap-3">
      {[
        [{ status: "Active", isActive: true, expiry: inDays(200) }, "Active — well clear of the window"],
        [{ status: "Expired", isActive: false, expiry: inDays(-40) }, "Expired"],
        [{ status: "Deactivated", isActive: false, expiry: inDays(200) }, "Deactivated — switched off on purpose"],
        [{}, "Unknown — nothing to go on"],
      ].map(([row, note], i) => (
        <div key={i} className="flex items-center gap-4">
          <div className="w-56">
            <LicenseStatusCell row={row} warnWithinDays={30} />
          </div>
          <span className="text-body-sm text-ink-muted">{note}</span>
        </div>
      ))}
    </div>
  ),
};

/** The escalation inside the warning window — one colour family getting stronger, then crossing into red. */
export const ExpiryUrgencyGrades = {
  render: () => (
    <div className="flex flex-col gap-3">
      {[
        [0, "critical — going today, so it reads as already gone"],
        [2, "high"],
        [10, "medium"],
        [25, "low — a clock, not an alarm"],
      ].map(([days, note]) => (
        <div key={days} className="flex items-center gap-4">
          <div className="w-56">
            <LicenseStatusCell row={{ status: "Active", isActive: true, expiry: inDays(days) }} warnWithinDays={30} />
          </div>
          <span className="text-body-sm text-ink-muted">{note}</span>
        </div>
      ))}
    </div>
  ),
};

/** `warnWithinDays` moves the whole window — the same licence reads differently under each. */
export const WarningWindow = {
  render: () => (
    <div className="flex flex-col gap-3">
      {[7, 30, 90].map((days) => (
        <div key={days} className="flex items-center gap-4">
          <div className="w-56">
            <LicenseStatusCell row={{ status: "Active", isActive: true, expiry: inDays(20) }} warnWithinDays={days} />
          </div>
          <span className="text-body-sm text-ink-muted">warnWithinDays={days}, expiring in 20 days</span>
        </div>
      ))}
    </div>
  ),
};

/** The matching row tint — only rows needing action are coloured. */
export const RowToneHelper = {
  render: () => (
    <div className="w-[32rem] overflow-hidden rounded-surface border border-card-border">
      {[
        { account: "Aaxis Nano", status: "Active", isActive: true, expiry: inDays(6) },
        { account: "Prima Equipment", status: "Expired", isActive: false, expiry: inDays(-30) },
        { account: "Abc Industries", status: "Active", isActive: true, expiry: inDays(300) },
        { account: "Deewan Enterprises", status: "Deactivated", isActive: false, expiry: inDays(100) },
      ].map((row) => {
        const tone = getLicenseRowTone(row, { warnWithinDays: 30 });
        return (
          <div
            key={row.account}
            className={`flex items-center justify-between border-b border-card-border px-4 py-2 last:border-0 ${
              tone === "warn" ? "bg-status-warn/10" : ""
            }`}
          >
            <span className="text-body-sm text-ink-primary">{row.account}</span>
            <LicenseStatusCell row={row} warnWithinDays={30} />
          </div>
        );
      })}
    </div>
  ),
};

/** Without the tooltip the exact date is no longer a hover away. */
export const WithoutTooltip = { args: { showTooltip: false } };
