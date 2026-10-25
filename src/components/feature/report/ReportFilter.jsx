import * as React from "react";
import { FilterPanel } from "../../common/FilterPanel";
import { Dropdown } from "../../common/Dropdown";
import { DateRangePicker } from "../../common/DateRangePicker";

function uniqueOptions(rows, key, labelKey) {
  const seen = new Set();
  const opts = [];
  (rows || []).forEach((r) => {
    const val = r?.[key];
    if (val === undefined || val === null || val === "") return;
    if (seen.has(val)) return;
    seen.add(val);
    opts.push({ value: val, label: labelKey ? r[labelKey] : val });
  });
  return opts;
}

/**
 * Filter the report by product, account, site, invoice, payment and date.
 *
 * Every dropdown's options come from `rows`, so they always match the data on
 * the page. `keys` remaps which row field backs each dropdown for datasets that
 * name them differently (e.g. `siteName` instead of `site`).
 */
export function ReportFilter({ open, onClose, filters, onChange, onSearch, onClear, rows = [], keys = {} }) {
  if (!open) return null;
  function set(patch) { onChange({ ...filters, ...patch }); }
  const k = {
    product: "product", account: "account", site: "site",
    invoice: "invoice", payment: "payment", ...keys,
  };
  const productOptions = uniqueOptions(rows, k.product);
  const accountOptions = uniqueOptions(rows, k.account);
  const siteOptions = uniqueOptions(rows, k.site);
  const invoiceOptions = uniqueOptions(rows, k.invoice);
  const paymentOptions = uniqueOptions(rows, k.payment);
  return (
    <FilterPanel open={open} onClose={onClose} onSearch={onSearch} onClear={onClear}>
      {productOptions.length > 0 && <Dropdown label="Product" placeholder="All" options={productOptions} value={filters.product} onChange={(v) => set({ product: v })} />}
      <Dropdown label="Account" placeholder="All" options={accountOptions} value={filters.account} onChange={(v) => set({ account: v })} />
      <Dropdown label="Site" placeholder="All" options={siteOptions} value={filters.site} onChange={(v) => set({ site: v })} />
      <Dropdown label="Invoice" placeholder="All" options={invoiceOptions} value={filters.invoice} onChange={(v) => set({ invoice: v })} />
      <Dropdown label="Payment" placeholder="All" options={paymentOptions} value={filters.payment} onChange={(v) => set({ payment: v })} />
      <DateRangePicker label="Date" value={filters.range ?? { from: null, to: null }} onChange={(v) => set({ range: v })} />
    </FilterPanel>
  );
}
