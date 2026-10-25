import * as React from "react";
import { ServerDataTable } from "../components/common/ServerDataTable";
import { AsyncDropdown } from "../components/common/AsyncDropdown";
import { AsyncMultiSelectDropdown } from "../components/common/AsyncMultiSelectDropdown";
import { Panel } from "../components/common/Panel";
import { Badge } from "../components/common/Badge";
import { Button } from "../components/common/Button";
import { createMockServerHandler } from "../lib/mockServer";
import { makeInitialLicenses } from "../data/mock";

const COLUMNS = [
  { key: "account", header: "Account", width: "20%", sortable: true },
  { key: "name", header: "License Name", width: "25%", sortable: true },
  {
    key: "status",
    header: "Status",
    width: "15%",
    sortable: true,
    render: (row) => (
      <Badge tone={row.status === "Active" ? "online" : row.status === "Expired" ? "offline" : "warn"}>
        {row.status}
      </Badge>
    ),
  },
  { key: "type", header: "Type", width: "15%", sortable: true },
  { key: "site", header: "Site Location", width: "25%", sortable: true },
];

export function ServerSidePage({ onToast }) {
  const [latency, setLatency] = React.useState(300);
  const [simulateError, setSimulateError] = React.useState(false);
  const [singleValue, setSingleValue] = React.useState(null);
  const [multiValues, setMultiValues] = React.useState([]);

  // Create memoized simulated REST server fetcher
  const mockFetcher = React.useMemo(() => {
    const rawData = makeInitialLicenses();
    return createMockServerHandler(rawData, {
      delayMs: latency,
      failureRate: simulateError ? 1.0 : 0,
      searchFields: ["account", "name", "site", "status", "type", "key"],
    });
  }, [latency, simulateError]);

  // Async dropdown option fetcher
  const loadAccountOptions = React.useCallback(async (query) => {
    await new Promise((res) => setTimeout(res, 200));
    const allLicenses = makeInitialLicenses();
    const uniqueAccounts = Array.from(new Set(allLicenses.map((l) => l.account)));
    let filtered = uniqueAccounts;
    if (query) {
      filtered = uniqueAccounts.filter((a) => a.toLowerCase().includes(query.toLowerCase()));
    }
    return filtered.map((acc) => ({ value: acc, label: acc }));
  }, []);

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 rounded-overlay bg-gradient-to-r from-accent/20 via-card to-card border border-accent/30 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-ink-primary">Server-Side Data Binding</h1>
            <Badge tone="accent">Enterprise Core</Badge>
          </div>
          <p className="text-body-sm text-ink-secondary mt-1">
            Seamless REST/GraphQL integration with server-side pagination, sorting, search debouncing, and async dropdowns.
          </p>
        </div>

        {/* Live Controls */}
        <div className="flex flex-wrap items-center gap-3 bg-canvas/80 p-2.5 rounded-surface border border-card-border">
          <div className="flex items-center gap-2 text-body-sm">
            <span className="font-semibold text-ink-secondary">Network Delay:</span>
            <select
              value={latency}
              onChange={(e) => setLatency(Number(e.target.value))}
              className="rounded-control border border-card-border bg-card px-2 py-1 text-body-sm text-ink-primary"
            >
              <option value={0}>0ms (Instant)</option>
              <option value={300}>300ms (Fast)</option>
              <option value={800}>800ms (3G Speed)</option>
              <option value={1500}>1500ms (Slow)</option>
            </select>
          </div>

          <Button
            variant={simulateError ? "danger" : "outline"}
            size="sm"
            onClick={() => {
              setSimulateError((prev) => !prev);
              onToast?.(simulateError ? "Error simulation OFF" : "Error simulation ON (Next request will fail)");
            }}
          >
            {simulateError ? "Disable Error Simulation" : "Simulate Server Error"}
          </Button>
        </div>
      </div>

      {/* Main Grid Section */}
      <Panel title="Server-Bound Data Grid (ServerDataTable)" className="shadow-md">
        <ServerDataTable
          fetcher={mockFetcher}
          columns={COLUMNS}
          initialPageSize={10}
          searchPlaceholder="Search remote server records (debounced)..."
          selectable
          onRowClick={(row) => onToast?.(`Clicked on server row: ${row.account}`)}
        />
      </Panel>

      {/* Async Dropdowns Section */}
      <Panel title="Async Remote Search Dropdowns" className="shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2 p-4 rounded-surface bg-canvas/50 border border-card-border">
            <h3 className="text-body-sm font-bold uppercase tracking-wider text-ink-secondary">Async Single Select Dropdown</h3>
            <p className="text-body-sm text-ink-muted mb-2">Fetches options dynamically from server API as user types.</p>
            <AsyncDropdown
              label="Select Backend Account"
              loadOptions={loadAccountOptions}
              value={singleValue}
              onChange={(val) => {
                setSingleValue(val);
                onToast?.(`Selected account: ${val || "None"}`);
              }}
              placeholder="Type to search accounts..."
            />
            {singleValue && (
              <p className="text-body-sm text-accent mt-2 font-medium">Active Value: {singleValue}</p>
            )}
          </div>

          <div className="flex flex-col gap-2 p-4 rounded-surface bg-canvas/50 border border-card-border">
            <h3 className="text-body-sm font-bold uppercase tracking-wider text-ink-secondary">Async Multi-Select Dropdown</h3>
            <p className="text-body-sm text-ink-muted mb-2">Multi-select with remote query debouncing.</p>
            <AsyncMultiSelectDropdown
              label="Filter Multiple Accounts"
              loadOptions={loadAccountOptions}
              value={multiValues}
              onChange={(vals) => {
                setMultiValues(vals);
                onToast?.(`Selected ${vals.length} account(s)`);
              }}
              placeholder="Search & pick accounts..."
            />
            {multiValues.length > 0 && (
              <p className="text-body-sm text-accent mt-2 font-medium">Selected ({multiValues.length}): {multiValues.join(", ")}</p>
            )}
          </div>
        </div>
      </Panel>
    </div>
  );
}
