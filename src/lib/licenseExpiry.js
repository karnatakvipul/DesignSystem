/**
 * Working out where a licence sits in its lifecycle.
 *
 * A licence row carries a stored `status` ("Active" / "Expired" /
 * "Deactivated") and an `expiry` date. The stored status alone cannot answer
 * the question a person actually has when they open this table — *which of
 * these do I need to deal with this week?* — because "Active" covers both a
 * licence with two years left and one that lapses on Friday.
 *
 * So the state shown in the table is derived from both: the stored status
 * decides whether the licence is live at all, and the expiry date decides
 * whether a live one needs attention soon.
 *
 * Everything here is pure and takes `now` as an argument. That keeps it
 * testable, and keeps "today" from being read at module load and then going
 * stale in a tab someone left open overnight.
 */

const MONTHS = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};

/** How many days out counts as "about to expire" unless a caller says otherwise. */
export const DEFAULT_WARN_WITHIN_DAYS = 30;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Parses the date formats this data actually uses.
 *
 * Dates are stored as the text the table displays — "02-Nov-2024",
 * "05-Mar-27", sometimes just "-" — rather than as real dates, so reading one
 * means parsing it. `Date.parse` is not used: it is implementation-defined for
 * non-ISO input, and on these strings different browsers disagree about
 * whether "05-Mar-27" is 2027 or 1927.
 *
 * Returns `null` for anything unparseable, including the "-" placeholder that
 * stands in for "no expiry recorded". A null here means *unknown*, and callers
 * must not treat unknown as expired.
 */
export function parseLicenseDate(value) {
  if (value == null) return null;

  const text = String(value).trim();
  if (!text || text === "-") return null;

  // dd-MMM-yyyy and dd-MMM-yy, the forms this table stores, allowing "/" or a
  // space in place of the hyphen.
  const dmy = /^(\d{1,2})[-/\s]([A-Za-z]{3,9})[-/\s](\d{2}|\d{4})$/.exec(text);
  if (dmy) {
    const month = MONTHS[dmy[2].slice(0, 3).toLowerCase()];
    if (month == null) return null;

    let year = Number(dmy[3]);
    // A two-digit year is read as 20xx up to '69 and 19xx beyond it — the same
    // window POSIX uses. Licence dates cluster around now, so this errs the
    // right way.
    if (dmy[3].length === 2) year += year >= 70 ? 1900 : 2000;

    return buildDate(year, month, Number(dmy[1]));
  }

  // ISO, in case a field is ever served as a real date.
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(text);
  if (iso) return buildDate(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));

  return null;
}

/**
 * Builds a local-midnight date, rejecting values that rolled over.
 *
 * `new Date(2025, 1, 31)` silently becomes 3 March. Checking the parts back
 * makes "31-Feb-2025" fail as unparseable instead of quietly landing on a day
 * that was never written down.
 */
function buildDate(year, month, day) {
  const date = new Date(year, month, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 * Whole days from today until `date` — negative once it has passed, 0 today.
 *
 * Both sides are collapsed to midnight first, so the answer is a count of
 * calendar days rather than of 24-hour periods. Without that, a licence
 * expiring tomorrow reads as "0 days" all afternoon. `Math.round` then absorbs
 * the 23- and 25-hour days that daylight-saving changes produce.
 */
export function daysUntil(date, now = new Date()) {
  if (!date) return null;
  return Math.round((startOfDay(date) - startOfDay(now)) / MS_PER_DAY);
}

/** Stored statuses, compared case- and space-insensitively. */
function normalizeStatus(status) {
  return String(status ?? "").trim().toLowerCase();
}

/**
 * The lifecycle state of one licence row.
 *
 * Returns `{ state, days, date, label, tone }` where `state` is one of:
 *
 *   "deactivated" — switched off by hand; expiry is no longer interesting
 *   "expired"     — past its expiry date, or stored as expired
 *   "expiring"    — live, but inside the warning window
 *   "active"      — live, with time to spare
 *   "unknown"     — no usable expiry date and nothing else to go on
 *
 * Deactivation is checked first and deliberately outranks the date. A licence
 * someone has switched off does not need an "about to expire" warning — that
 * would send people chasing renewals for licences nobody is using.
 */
export function getLicenseLifecycle(row, options = {}) {
  const {
    now = new Date(),
    warnWithinDays = DEFAULT_WARN_WITHIN_DAYS,
  } = options;

  const status = normalizeStatus(row?.status);
  const date = parseLicenseDate(row?.expiry);
  const days = daysUntil(date, now);

  if (status === "deactivated" || status === "inactive") {
    return { state: "deactivated", days, date, label: "Deactivated", tone: "neutral" };
  }

  if (status === "expired" || (days != null && days < 0)) {
    return { state: "expired", days, date, label: "Expired", tone: "offline" };
  }

  if (days != null && days <= warnWithinDays) {
    return { state: "expiring", days, date, label: describeTimeLeft(days), tone: "warn" };
  }

  if (!status) {
    return { state: "unknown", days, date, label: "Unknown", tone: "neutral" };
  }

  return { state: "active", days, date, label: "Active", tone: "online" };
}

/**
 * How urgent an expiry is, in bands rather than a raw day count.
 *
 * A licence with a day left is a different job from one with three weeks, and
 * "expiring" alone cannot say which you are looking at. The reference app
 * makes the same distinction by painting whole rows in four shades of yellow;
 * the bands are the useful part of that, used here to grade the status cell
 * instead — a wide table washed in colour is a lot of paint carrying one bit
 * of information, and it is the cell beside it that can say exactly how long.
 *
 * @returns {"critical"|"high"|"medium"|"low"|null} Null when nothing is due.
 */
export function getExpiryUrgency(row, options = {}) {
  const { state, days } = getLicenseLifecycle(row, options);

  // Already gone, or goes today — both are "deal with this now".
  if (state === "expired") return "critical";
  if (state !== "expiring") return null;
  if (days <= 0) return "critical";
  if (days <= 7) return "high";
  if (days <= 15) return "medium";
  return "low";
}

/**
 * How the warning reads.
 *
 * The reference app writes "About to expire in 1 day(s)"; the "(s)" is dropped
 * here in favour of agreeing with the number, since the count is the part
 * people actually read and a wrong plural next to it is a small papercut on
 * every row.
 */
export function describeTimeLeft(days) {
  if (days == null) return "Active";
  if (days < 0) return "Expired";
  if (days === 0) return "Expires today";
  if (days === 1) return "About to expire in 1 day";
  return `About to expire in ${days} days`;
}

/**
 * The long form for a tooltip: the state plus the date it turns on.
 *
 * The cell shows a countdown because that is the useful number at a glance;
 * this gives the actual date for anyone who needs to act on it.
 */
export function describeExpiry(row, options = {}) {
  const { state, days, date } = getLicenseLifecycle(row, options);
  const on = date ? formatLicenseDate(date) : null;

  if (state === "deactivated") return on ? `Deactivated — expiry was ${on}` : "Deactivated";
  if (state === "expired") {
    if (!on) return "Expired";
    const ago = days == null ? null : Math.abs(days);
    if (ago == null || ago === 0) return `Expired on ${on}`;
    return `Expired on ${on} (${ago} ${ago === 1 ? "day" : "days"} ago)`;
  }
  if (!on) return "No expiry date recorded";
  return `Expires on ${on}`;
}

/** Formats back into the dd-MMM-yyyy the rest of the table displays. */
export function formatLicenseDate(date) {
  if (!date) return "-";
  const month = Object.keys(MONTHS)[date.getMonth()];
  const name = month.charAt(0).toUpperCase() + month.slice(1);
  return `${String(date.getDate()).padStart(2, "0")}-${name}-${date.getFullYear()}`;
}
