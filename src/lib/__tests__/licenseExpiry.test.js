import { describe, it, expect } from "vitest";
import {
  parseLicenseDate,
  daysUntil,
  getLicenseLifecycle,
  describeTimeLeft,
  describeExpiry,
  formatLicenseDate,
} from "../licenseExpiry";

// Fixed so these never depend on the day they are run.
const NOW = new Date(2026, 7, 10); // 10 Aug 2026

describe("parseLicenseDate", () => {
  it("reads the dd-MMM-yyyy form the table stores", () => {
    expect(parseLicenseDate("02-Nov-2024")).toEqual(new Date(2024, 10, 2));
  });

  it("reads a two-digit year, splitting at '70", () => {
    expect(parseLicenseDate("05-Mar-27")).toEqual(new Date(2027, 2, 5));
    expect(parseLicenseDate("05-Mar-70")).toEqual(new Date(1970, 2, 5));
  });

  it("accepts slashes and spaces in place of hyphens", () => {
    expect(parseLicenseDate("05/Mar/2027")).toEqual(new Date(2027, 2, 5));
    expect(parseLicenseDate("5 March 2027")).toEqual(new Date(2027, 2, 5));
  });

  it("reads ISO dates, in case a field is ever served as a real date", () => {
    expect(parseLicenseDate("2027-03-05")).toEqual(new Date(2027, 2, 5));
  });

  it("treats the '-' placeholder and blanks as no date rather than as a value", () => {
    expect(parseLicenseDate("-")).toBeNull();
    expect(parseLicenseDate("")).toBeNull();
    expect(parseLicenseDate(null)).toBeNull();
    expect(parseLicenseDate(undefined)).toBeNull();
  });

  it("rejects a day that does not exist instead of rolling into the next month", () => {
    // new Date(2025, 1, 31) silently becomes 3 March.
    expect(parseLicenseDate("31-Feb-2025")).toBeNull();
    expect(parseLicenseDate("32-Jan-2025")).toBeNull();
  });

  it("rejects a month it does not recognise", () => {
    expect(parseLicenseDate("05-Xyz-2027")).toBeNull();
  });
});

describe("daysUntil", () => {
  it("counts calendar days, not 24-hour periods", () => {
    // Late in the day: tomorrow is still 1 day away, not 0.
    const lateToday = new Date(2026, 7, 10, 23, 30);
    expect(daysUntil(new Date(2026, 7, 11), lateToday)).toBe(1);
  });

  it("is 0 on the day itself and negative once passed", () => {
    expect(daysUntil(new Date(2026, 7, 10), NOW)).toBe(0);
    expect(daysUntil(new Date(2026, 7, 3), NOW)).toBe(-7);
  });

  it("returns null when there is no date", () => {
    expect(daysUntil(null, NOW)).toBeNull();
  });
});

describe("getLicenseLifecycle", () => {
  const on = (expiry, status = "Active") =>
    getLicenseLifecycle({ status, expiry }, { now: NOW, warnWithinDays: 30 });

  it("leaves a licence with time to spare as Active", () => {
    expect(on("10-Dec-2026")).toMatchObject({ state: "active", label: "Active" });
  });

  it("counts down once inside the warning window", () => {
    expect(on("16-Aug-2026")).toMatchObject({
      state: "expiring",
      days: 6,
      label: "About to expire in 6 days",
    });
  });

  it("includes both ends of the window", () => {
    expect(on("10-Aug-2026").state).toBe("expiring"); // today
    expect(on("09-Sep-2026").state).toBe("expiring"); // exactly 30 days
    expect(on("10-Sep-2026").state).toBe("active"); // 31 days — outside
  });

  it("reads a passed date as expired even when the record still says Active", () => {
    expect(on("09-Aug-2026")).toMatchObject({ state: "expired", days: -1 });
  });

  it("trusts a stored Expired status even with no usable date", () => {
    expect(on("-", "Expired").state).toBe("expired");
  });

  it("does not chase a deactivated licence about its renewal", () => {
    // Deactivation outranks the date: this one expires in 6 days, but nobody is
    // using it, so it must not be flagged as needing attention.
    expect(on("16-Aug-2026", "Deactivated")).toMatchObject({
      state: "deactivated",
      label: "Deactivated",
    });
  });

  it("does not treat an unreadable date as expired", () => {
    expect(on("-").state).toBe("active");
    expect(on("not a date").state).toBe("active");
  });

  it("ignores case and stray spacing in the stored status", () => {
    expect(on("16-Aug-2026", "  deactivated ").state).toBe("deactivated");
  });

  it("honours a caller's own warning window", () => {
    const row = { status: "Active", expiry: "16-Aug-2026" };
    expect(getLicenseLifecycle(row, { now: NOW, warnWithinDays: 3 }).state).toBe("active");
    expect(getLicenseLifecycle(row, { now: NOW, warnWithinDays: 7 }).state).toBe("expiring");
  });

  it("survives a missing row", () => {
    expect(getLicenseLifecycle(null, { now: NOW }).state).toBe("unknown");
  });
});

describe("describeTimeLeft", () => {
  it("agrees with the number in front of it", () => {
    expect(describeTimeLeft(0)).toBe("Expires today");
    expect(describeTimeLeft(1)).toBe("About to expire in 1 day");
    expect(describeTimeLeft(2)).toBe("About to expire in 2 days");
  });
});

describe("describeExpiry", () => {
  const opts = { now: NOW, warnWithinDays: 30 };

  it("gives the date behind the countdown", () => {
    expect(describeExpiry({ status: "Active", expiry: "16-Aug-2026" }, opts))
      .toBe("Expires on 16-Aug-2026");
  });

  it("says how long ago an expired one lapsed", () => {
    expect(describeExpiry({ status: "Active", expiry: "09-Aug-2026" }, opts))
      .toBe("Expired on 09-Aug-2026 (1 day ago)");
  });

  it("says so plainly when no date was recorded", () => {
    expect(describeExpiry({ status: "Active", expiry: "-" }, opts))
      .toBe("No expiry date recorded");
  });
});

describe("formatLicenseDate", () => {
  it("round-trips through the format the table displays", () => {
    expect(formatLicenseDate(parseLicenseDate("02-Nov-2024"))).toBe("02-Nov-2024");
  });

  it("pads a single-digit day so columns of dates line up", () => {
    expect(formatLicenseDate(new Date(2026, 0, 5))).toBe("05-Jan-2026");
  });
});
