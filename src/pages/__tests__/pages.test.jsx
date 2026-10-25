import React from "react";
import { render, screen, waitFor, within, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { LicensePage } from "../LicensePage";
import { UsersPage } from "../UsersPage";
import { ReportPage } from "../ReportPage";
import { HomeDashboard } from "../HomeDashboard";
import { ServerSidePage } from "../ServerSidePage";
import { SlsReportDashboard } from "../SlsReportDashboard";
import { UserProfilePage } from "../UserProfilePage";
import { LicenseTypePage } from "../masters/LicenseTypePage";
import { LicenseTermPage } from "../masters/LicenseTermPage";
import { ProductTypePage } from "../masters/ProductTypePage";
import { MasterListPage } from "../masters/MasterListPage";
import { LoginForm } from "../auth/LoginForm";
import { LoginPasswordForm } from "../auth/LoginPasswordForm";

/**
 * These pages ship in the package but nothing exercised them, so they had
 * drifted: the licence table still rendered a plain status badge long after the
 * expiry countdown existed, and every one of them carried the same missing
 * dependency in its server-sync effect.
 *
 * The bar here is deliberately the one that was missing — that each page
 * mounts, renders its data, and survives being handed nothing — rather than a
 * deep behavioural suite for thirteen screens. It is what turns "unproven" into
 * "known to work", and what makes the next change to them detectable.
 */

const originalMatchMedia = window.matchMedia;
beforeEach(() => {
  // Desktop, so the table renders rather than the card list.
  window.matchMedia = vi.fn().mockImplementation((query) => ({
    matches: !query.includes("max-width: 767px"),
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
  window.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});
afterEach(() => {
  window.matchMedia = originalMatchMedia;
  vi.restoreAllMocks();
});

const licences = [
  {
    id: 1, account: "Acme Corp", name: "Plant 1", status: "Active", type: "EF-1Y",
    term: "Yearly", key: "abc-123", issue: "01-Jan-2026", actDate: "01-Jan-2026",
    expiry: "01-Jan-2099", site: "Site 1", lastPi: "-", lastInvoice: "-",
    amount: "0.00", payment: "-",
  },
  {
    id: 2, account: "Beta LLC", name: "Plant 2", status: "Expired", type: "EF-1Y",
    term: "Yearly", key: "def-456", issue: "01-Jan-2020", actDate: "01-Jan-2020",
    expiry: "01-Jan-2021", site: "Site 2", lastPi: "-", lastInvoice: "-",
    amount: "0.00", payment: "-",
  },
];

/** A licence that expires soon enough to be inside the 30-day warning window. */
function expiringSoon() {
  const soon = new Date();
  soon.setDate(soon.getDate() + 6);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const formatted = `${String(soon.getDate()).padStart(2, "0")}-${months[soon.getMonth()]}-${soon.getFullYear()}`;
  return [{ ...licences[0], id: 3, account: "Gamma Ltd", status: "Active", expiry: formatted }];
}

const users = [
  { id: 1, name: "Vipul", email: "vipul@my Design System.com", role: "Super Administrator", status: "Active" },
];

const reports = [
  { id: 1, account: "Acme Corp", siteName: "Site 1", licenseType: "EF-1Y", licenseKey: "abc-123", invoiceNo: "INV-1", amount: "100.00", paymentStatus: "Paid" },
];

const masters = [
  { id: 1, name: "Yearly", description: "Twelve months", product: "SLS", productType: "Cloud" },
];

/**
 * Queries the desktop table.
 *
 * These pages render the desktop table and the mobile card list together and
 * hide one with a CSS class. jsdom applies no CSS, so both are in the document
 * and every value appears twice — scoping to the table is what makes a query
 * mean "the row shows this".
 */
function inTable() {
  return within(document.querySelector("table"));
}

function tableRows() {
  return within(document.querySelector("tbody")).getAllByRole("row");
}

describe("LicensePage", () => {
  it("renders the licences it is given", () => {
    render(<LicensePage initialData={licences} />);
    expect(inTable().getByText("Acme Corp")).toBeDefined();
    expect(inTable().getByText("Beta LLC")).toBeDefined();
  });

  it("shows the derived lifecycle, not the stored status", () => {
    // The drift this page had: it rendered `status` verbatim in a badge, so a
    // licence lapsing on Friday looked identical to one with two years left.
    render(<LicensePage initialData={expiringSoon()} />);
    expect(inTable().getByText("About to expire in 6 days")).toBeDefined();
  });

  it("tints the row of a licence that needs attention", () => {
    render(<LicensePage initialData={expiringSoon()} />);
    expect(tableRows()[0].className).toContain("bg-status-warn");
  });

  it("leaves a licence with time to spare alone", () => {
    render(<LicensePage initialData={[licences[0]]} />);
    expect(tableRows()[0].className).not.toContain("bg-status-warn");
    expect(inTable().getByText("Active")).toBeDefined();
  });

  it("reads a page from a fetcher when given one", async () => {
    const fetcher = vi.fn(async () => ({ data: licences, total: 2 }));
    render(<LicensePage fetcher={fetcher} serverSide />);

    await waitFor(() => expect(fetcher).toHaveBeenCalled());
    await waitFor(() => expect(inTable().getByText("Acme Corp")).toBeDefined());
  });

  it("renders with no data at all", () => {
    render(<LicensePage initialData={[]} />);
    expect(screen.getByText(/no licenses match/i)).toBeDefined();
  });
});

describe("UsersPage", () => {
  it("renders the users it is given", () => {
    render(<UsersPage initialData={users} />);
    expect(inTable().getByText("Vipul")).toBeDefined();
  });

  it("reads from a fetcher", async () => {
    const fetcher = vi.fn(async () => ({ data: users, total: 1 }));
    render(<UsersPage fetcher={fetcher} serverSide />);
    await waitFor(() => expect(fetcher).toHaveBeenCalled());
  });

  it("renders empty", () => {
    render(<UsersPage initialData={[]} />);
    expect(document.querySelector("table")).not.toBeNull();
  });
});

describe("ReportPage", () => {
  it("renders the rows it is given", () => {
    render(<ReportPage initialData={reports} />);
    expect(inTable().getByText("Acme Corp")).toBeDefined();
  });

  it("reads from a fetcher", async () => {
    const fetcher = vi.fn(async () => ({ data: reports, total: 1 }));
    render(<ReportPage fetcher={fetcher} serverSide />);
    await waitFor(() => expect(fetcher).toHaveBeenCalled());
  });
});

describe("master data pages", () => {
  it("MasterListPage renders its items", () => {
    render(
      <MasterListPage
        title="License Terms"
        items={masters}
        columns={[{ key: "name", header: "NAME" }]}
      />
    );
    expect(inTable().getByText("Yearly")).toBeDefined();
  });

  it("MasterListPage reads from a fetcher", async () => {
    const fetcher = vi.fn(async () => ({ data: masters, total: 1 }));
    render(<MasterListPage title="License Terms" fetcher={fetcher} serverSide />);
    await waitFor(() => expect(fetcher).toHaveBeenCalled());
  });

  it("LicenseTypePage renders", () => {
    render(<LicenseTypePage />);
    expect(document.body.textContent.length).toBeGreaterThan(0);
  });

  it("LicenseTermPage renders", () => {
    render(<LicenseTermPage />);
    expect(document.body.textContent.length).toBeGreaterThan(0);
  });

  it("ProductTypePage renders", () => {
    render(<ProductTypePage />);
    expect(document.body.textContent.length).toBeGreaterThan(0);
  });
});

describe("dashboards", () => {
  it("HomeDashboard renders", () => {
    render(<HomeDashboard />);
    expect(document.body.textContent.length).toBeGreaterThan(0);
  });

  it("HomeDashboard reads from a fetcher", async () => {
    const fetcher = vi.fn(async () => ({ data: [], total: 0 }));
    render(<HomeDashboard fetcher={fetcher} serverSide />);
    await waitFor(() => expect(fetcher).toHaveBeenCalled());
  });

  it("SlsReportDashboard renders", () => {
    render(<SlsReportDashboard />);
    expect(document.body.textContent.length).toBeGreaterThan(0);
  });

  it("ServerSidePage renders", () => {
    render(<ServerSidePage />);
    expect(document.body.textContent.length).toBeGreaterThan(0);
  });

  it("UserProfilePage renders", () => {
    render(<UserProfilePage />);
    expect(document.body.textContent.length).toBeGreaterThan(0);
  });
});

describe("sign-in", () => {
  it("LoginForm hands the identifier on once it validates", async () => {
    const onContinue = vi.fn();
    render(<LoginForm label="Username" validate={async () => {}} onContinue={onContinue} />);

    fireEvent.change(document.querySelector("input"), { target: { value: "admin" } });
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    await waitFor(() => expect(onContinue).toHaveBeenCalledWith("admin"));
  });

  it("LoginForm refuses an empty identifier rather than continuing", async () => {
    const onContinue = vi.fn();
    render(<LoginForm label="Username" validate={async () => {}} onContinue={onContinue} />);

    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    await waitFor(() => expect(screen.getByText(/please enter/i)).toBeDefined());
    expect(onContinue).not.toHaveBeenCalled();
  });

  it("LoginPasswordForm shows whose account it is signing into", () => {
    render(<LoginPasswordForm email="admin" onSignIn={vi.fn()} onBack={vi.fn()} />);
    expect(screen.getByText("admin")).toBeDefined();
  });
});
