import { LicenseToolbar } from "./LicenseToolbar";

/**
 * The row of icon actions above a licence table — and, despite the name, above
 * the master-data tables too.
 *
 * `actions` selects which of the sixteen possible buttons render. That is what
 * lets a masters screen show only `["edit", "delete"]` without inheriting the
 * licence lifecycle actions it has no use for.
 *
 * `order` then overrides the sequence. Passing it also switches the toolbar
 * from its default grouped layout (with dividers between related actions) to a
 * single flat row, on both desktop and mobile — so use it when the page wants
 * an explicit order rather than the library's grouping.
 *
 * `selectedCount` drives which buttons are enabled: actions scoped to a row
 * are dead until something is selected.
 */
const meta = {
  title: "Feature/License/LicenseToolbar",
  component: LicenseToolbar,
  tags: ["autodocs"],
  argTypes: {
    selectedCount: {
      control: { type: "number", min: 0 },
      description: "Row-scoped actions stay disabled at zero.",
    },
    actions: {
      control: "object",
      description:
        'Which buttons to render. Any of: `view`, `property`, `activate`, `deactivate`, `renewal`, `history`, `timeline`, `offlinePayment`, `invoice`, `download`, `externalDevice`, `add`, `edit`, `delete`, `filter`. Defaults to all.',
    },
    order: {
      control: "object",
      description: "Explicit display order. Also flattens the grouped layout. Keys absent from `actions` are ignored.",
    },
    onViewDetails: { action: "view details" },
    onAdd: { action: "add" },
    onEdit: { action: "edit" },
    onDelete: { action: "delete" },
    onActivate: { action: "activate" },
    onDeactivate: { action: "deactivate" },
    onUpdateProperty: { action: "update property" },
    onRenewal: { action: "renewal" },
    onHistory: { action: "history" },
    onTimeline: { action: "timeline" },
    onInvoice: { action: "invoice" },
    onDownload: { action: "download" },
    onFilter: { action: "filter", description: "Omit to hide the filter button even when listed in `actions`." },
    onExternalDeviceInfo: { action: "external device info" },
    className: { control: "text" },
  },
  args: { selectedCount: 1 },
  render: (args) => (
    <div className="w-full rounded-surface border border-card-border p-2">
      <LicenseToolbar {...args} />
    </div>
  ),
};

export default meta;

/** Every action, in the default grouped layout. */
export const Playground = {};

/** Nothing selected — row-scoped actions are disabled. */
export const NothingSelected = { args: { selectedCount: 0 } };

/** A masters screen: two actions, nothing else. */
export const MasterDataSubset = {
  args: { actions: ["edit", "delete"], selectedCount: 1 },
};

/** The licence page's real set, in its own explicit order — note the flat row, no dividers. */
export const LicensePageOrder = {
  args: {
    actions: ["edit", "delete", "property", "activate", "deactivate", "history", "invoice", "timeline", "download", "renewal"],
    order: ["edit", "delete", "property", "activate", "deactivate", "invoice", "history", "timeline", "download", "renewal"],
    selectedCount: 1,
  },
};

/** Grouped (no `order`) versus flat (`order` given) — the same buttons, different layout. */
export const GroupedVersusFlat = {
  render: () => {
    const actions = ["edit", "delete", "activate", "deactivate", "download"];
    return (
      <div className="flex flex-col gap-6">
        <div>
          <p className="mb-2 text-body-sm text-ink-muted">Default grouped layout</p>
          <div className="rounded-surface border border-card-border p-2">
            <LicenseToolbar actions={actions} selectedCount={1} />
          </div>
        </div>
        <div>
          <p className="mb-2 text-body-sm text-ink-muted">Flat, via `order`</p>
          <div className="rounded-surface border border-card-border p-2">
            <LicenseToolbar actions={actions} order={actions} selectedCount={1} />
          </div>
        </div>
      </div>
    );
  },
};

/** Several rows selected — bulk-capable actions stay live, single-row ones do not. */
export const BulkSelection = { args: { selectedCount: 12 } };

/** On a phone the actions collapse into a labelled drawer. */
export const Mobile = {
  parameters: { viewport: { defaultViewport: "mobile1" } },
  args: { actions: ["edit", "delete", "activate", "deactivate", "download"], selectedCount: 1 },
};
