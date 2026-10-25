import * as React from "react";
import { CircleCheck, CircleX, ChevronDown, Pencil, Trash2 } from "lucide-react";
import { Modal } from "../../common/Modal";
import { Button } from "../../common/Button";
import { IconButton } from "../../common/IconButton";
import { FilterPanel } from "../../common/FilterPanel";
import { Dropdown } from "../../common/Dropdown";
import { DateRangePicker } from "../../common/DateRangePicker";
import { DataTable } from "../../common/DataTable";
import { Pagination } from "../../common/Pagination";
import { TruncatedText } from "../../common/TruncatedText";

/**
 * The renewal stream for a licence — the key/value events recorded against it.
 *
 * A row is one property of one licence at one moment: `datarate` carrying a
 * licence type, `active` carrying a flag. So the table is a property log, not
 * a list of licences, and the same licence appears once per property it has.
 *
 * ── The two scopes ──────────────────────────────────────────────────────────
 *
 * Opened from a selected licence it shows that licence's stream. Running a
 * search drops the licence and searches every stream by product, account and
 * date instead — the same table answering a different question. The reference
 * app latches that switch for the rest of the page's life; here it resets on
 * close, because being shown the whole table when you asked about one row is
 * not an answer.
 *
 * @typedef {Object} RenewalStreamRow
 * @property {string|number} id
 * @property {string} accountName
 * @property {string} name Licence name
 * @property {string} key Property recorded, e.g. "active", "datarate"
 * @property {string} value Its value — a flag for `active`, text otherwise
 * @property {string} licenseKey
 * @property {string} ticketNo
 * @property {string|number|Date} timestamp
 */

/** Defaults to the calendar year, the window renewals are read over. */
function currentYear() {
  const now = new Date();
  return { from: new Date(now.getFullYear(), 0, 1), to: new Date(now.getFullYear(), 11, 31) };
}

const initialFilters = () => ({ product: null, account: null, ...currentYear() });

const capitalise = (text) =>
  typeof text === "string" && text ? text.charAt(0).toUpperCase() + text.slice(1) : text;

/**
 * `active` is a flag and reads as one; every other key carries text.
 *
 * The value arrives as a string either way, so this compares loosely rather
 * than trusting a type the API does not actually promise.
 */
function StreamValue({ row }) {
  if (row.value === null || row.value === undefined || row.value === "") return "-";

  if (String(row.key).toLowerCase() !== "active") {
    return <TruncatedText text={row.value} className="text-body-sm text-ink-primary" />;
  }

  const activated = String(row.value) === "1" || row.value === true;
  return (
    <span
      className="flex justify-center"
      title={activated ? "Activated" : "Deactivated"}
      aria-label={activated ? "Activated" : "Deactivated"}
    >
      {activated ? (
        <CircleCheck size={15} className="text-status-online" />
      ) : (
        <CircleX size={15} className="text-status-offline" />
      )}
    </span>
  );
}

function formatTimestamp(value) {
  if (value === null || value === undefined || value === "") return "-";
  // .NET's `/Date(ms)/` travels through some of these APIs verbatim.
  const dotNet = typeof value === "string" && /^\/Date\((-?\d+)\)\/$/.exec(value);
  const date = new Date(dotNet ? Number(dotNet[1]) : value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function LicenseRenewalModal({
  open,
  onClose,
  rows = [],
  total,
  page = 1,
  pageSize = 20,
  onPageChange,
  loading = false,
  error = null,
  onRetry,
  onSearch,
  productOptions = [],
  accountOptions = [],
  onProductChange,
  onEditRow,
  onDeleteRow,
  onManage,
}) {
  const [filterOpen, setFilterOpen] = React.useState(false);
  const [filters, setFilters] = React.useState(initialFilters);
  const [selectedKeys, setSelectedKeys] = React.useState([]);

  // Reopening starts over: the panel's contents are a question about this
  // licence, and last time's answer is not it.
  React.useEffect(() => {
    if (!open) return;
    setFilters(initialFilters());
    setFilterOpen(false);
    setSelectedKeys([]);
  }, [open]);

  const setFilter = (patch) => setFilters((f) => ({ ...f, ...patch }));

  const rowActions = !!onEditRow || !!onDeleteRow;
  const selectedRow =
    selectedKeys.length === 1 ? rows.find((r) => r.id === selectedKeys[0]) ?? null : null;

  const activeCount = [filters.product, filters.account, filters.from || filters.to ? "date" : null]
    .filter(Boolean).length;

  const columns = [
    {
      key: "accountName",
      header: "ACCOUNT",
      minWidth: 150,
      render: (r) => <TruncatedText text={r.accountName || "-"} className="text-body-sm text-ink-primary" />,
    },
    {
      key: "name",
      header: "NAME",
      minWidth: 180,
      render: (r) => <TruncatedText text={r.name || "-"} className="text-body-sm text-ink-primary" />,
    },
    {
      key: "key",
      header: "KEY",
      minWidth: 90,
      render: (r) => <span className="text-body-sm text-ink-primary">{capitalise(r.key) || "-"}</span>,
    },
    { key: "value", header: "VALUE", minWidth: 130, align: "center", render: (r) => <StreamValue row={r} /> },
    {
      key: "licenseKey",
      header: "LICENSE KEY",
      minWidth: 150,
      render: (r) => (
        <TruncatedText text={r.licenseKey || "-"} className="font-mono text-caption text-ink-secondary" />
      ),
    },
    {
      key: "ticketNo",
      header: "TICKET NO",
      minWidth: 110,
      render: (r) => <span className="text-body-sm text-ink-secondary">{r.ticketNo || "-"}</span>,
    },
    {
      key: "timestamp",
      header: "TIMESTAMP",
      minWidth: 150,
      render: (r) => (
        <span className="whitespace-nowrap text-body-sm text-ink-secondary">{formatTimestamp(r.timestamp)}</span>
      ),
    },
  ];

  const rowCount = typeof total === "number" ? total : rows.length;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="License Renewal Stream"
      size="xl"
      footer={
        <>
          {onManage && (
            <Button variant="secondary" onClick={onManage}>
              Manage Streams
            </Button>
          )}
          <Button variant="cancel" onClick={onClose}>
            Close
          </Button>
        </>
      }
    >
      <div className="flex min-h-[280px] flex-col gap-2">
        {/* Row actions left, filter and paging right. The reference app puts
            Filter up in the title bar; `Modal` owns that bar, so it sits at the
            head of the body instead — beside the paging it belongs with. */}
        <div className="flex items-center justify-between gap-3">
          {rowActions ? (
            <div className="flex items-center gap-1 rounded-control border border-card-border p-1">
              {onEditRow && (
                <IconButton
                  icon={<Pencil size={15} />}
                  label="Edit stream row"
                  disabled={!selectedRow}
                  onClick={() => selectedRow && onEditRow(selectedRow)}
                />
              )}
              {onDeleteRow && (
                <IconButton
                  icon={<Trash2 size={15} />}
                  label="Delete stream row"
                  disabled={!selectedRow}
                  onClick={() => selectedRow && onDeleteRow(selectedRow)}
                />
              )}
            </div>
          ) : (
            <span />
          )}

          <div className="relative flex items-center gap-3">
            <Pagination page={page} pageSize={pageSize} total={rowCount} onPageChange={onPageChange} />

            <Button
              variant="secondary"
              size="sm"
              onClick={() => setFilterOpen((v) => !v)}
              aria-expanded={filterOpen}
              className="gap-1.5"
            >
              Filter
              <ChevronDown
                size={14}
                className={filterOpen ? "rotate-180 transition-transform" : "transition-transform"}
              />
            </Button>

            <FilterPanel
              open={filterOpen}
              onClose={() => setFilterOpen(false)}
              title="Filter Renewal Stream"
              activeCount={activeCount}
              layout="rows"
              actionAlign="end"
              searchLabel="Search"
              clearLabel="Clear filters"
              // Pinned to the dialog's right edge so a panel wider than its
              // trigger opens inwards over the table rather than off the side.
              position="absolute top-full right-0 z-[120] mt-2"
              onSearch={() => onSearch?.(filters)}
              onClear={() => {
                setFilters(initialFilters());
                onSearch?.(null);
              }}
            >
              {/* Dropped entirely when the app has no products to offer,
                  rather than shown empty — a filter that cannot narrow
                  anything is worse than one that isn't there. */}
              {productOptions.length > 0 && (
                <Dropdown
                  label="Product"
                  placeholder="All"
                  options={productOptions}
                  value={filters.product}
                  onChange={(v) => {
                    setFilter({ product: v, account: null });
                    onProductChange?.(v);
                  }}
                />
              )}
              <Dropdown
                label="Account"
                placeholder="All"
                options={accountOptions}
                value={filters.account}
                onChange={(v) => setFilter({ account: v })}
              />
              <DateRangePicker
                label="Date"
                value={{ from: filters.from, to: filters.to }}
                onChange={(range) => setFilter({ from: range?.from ?? null, to: range?.to ?? null })}
              />
            </FilterPanel>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={rows}
          rowKey={(r) => r.id}
          loading={loading}
          error={error}
          onRetry={onRetry}
          serverSide
          dense
          // Selection only earns its column when there is something to do with
          // the row it selects.
          selectable={rowActions}
          selectedKeys={selectedKeys}
          onSelectedKeysChange={setSelectedKeys}
          emptyMessage="No renewal stream recorded for this license."
          className="flex-1"
        />
      </div>
    </Modal>
  );
}
