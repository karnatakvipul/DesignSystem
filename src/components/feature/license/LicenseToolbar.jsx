import * as React from "react";
import {
  Eye,
  Pencil,
  Trash2,
  Tag,
  Check,
  UserCog,
  Briefcase,
  Network,
  ListChecks,
  Diamond,
  Wallet,
  Download,
  Plus,
  HardDrive,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { IconButton } from "../../common/IconButton";
import { cn } from "../../../lib/cn";

/** Every action this toolbar can render, in display order. */
const ALL_ACTIONS = [
  "view",
  "property",
  "activate",
  "deactivate",
  "renewal",
  "history",
  "timeline",
  "offlinePayment",
  "invoice",
  "download",
  "externalDevice",
  "add",
  "edit",
  "delete",
  "filter",
];

/**
 * Standalone responsive row of action buttons with labeled mobile drawer and
 * grouped desktop view.
 *
 * `actions` selects which of ALL_ACTIONS to render — pass e.g.
 * `["add", "edit", "delete"]` on a master-data screen that has no license
 * lifecycle actions. Defaults to all of them, so existing callers are
 * unaffected.
 *
 * `order` optionally overrides display order on top of `actions` — pass the
 * action keys in the exact sequence they should render (keys not also
 * present in `actions` are ignored). When given, buttons render as a single
 * flat row/drawer with no group dividers, on both desktop and mobile. Omit
 * it to keep the default grouped layout.
 */
export function LicenseToolbar({
  selectedCount = 0,
  onViewDetails,
  onAdd = () => {},
  onEdit = () => {},
  onDelete = () => {},
  onActivate = () => {},
  onDeactivate = () => {},
  onUpdateProperty = () => {},
  onRenewal = () => {},
  onHistory = () => {},
  onTimeline = () => {},
  onInvoice = () => {},
  onDownload = () => {},
  onFilter,
  onExternalDeviceInfo = () => {},
  actions = ALL_ACTIONS,
  order,
  className
}) {
  const [expanded, setExpanded] = React.useState(false);
  const hasSelection = selectedCount > 0;
  const isSingleSelection = selectedCount === 1;

  const enabled = React.useMemo(() => new Set(actions), [actions]);
  // "view" additionally requires a handler, since there's nothing sensible to
  // show without one.
  const shows = React.useCallback(
    (key) => {
      if (!enabled.has(key)) return false;
      // These two have nothing sensible to do without a handler.
      if (key === "view") return !!onViewDetails;
      if (key === "filter") return !!onFilter;
      return true;
    },
    [enabled, onViewDetails, onFilter]
  );

  const mobileActionDefs = {
    view: { label: "View Details", icon: <Eye size={15} />, disabled: !isSingleSelection, onClick: onViewDetails, show: shows("view") },
    property: { label: "Update Property", icon: <Tag size={15} />, disabled: !isSingleSelection, onClick: onUpdateProperty, show: shows("property") },
    activate: { label: "Activate License", icon: <Check size={15} />, disabled: !hasSelection, onClick: onActivate, show: shows("activate") },
    deactivate: { label: "Deactivate License", icon: <UserCog size={15} />, disabled: !hasSelection, onClick: onDeactivate, show: shows("deactivate") },
    renewal: { label: "License Renewal", icon: <Diamond size={15} />, disabled: !isSingleSelection, onClick: onRenewal, show: shows("renewal") },
    history: { label: "Get History Pi And Invoice", icon: <Briefcase size={15} />, disabled: !isSingleSelection, onClick: onHistory, show: shows("history") },
    timeline: { label: "View Timeline", icon: <ListChecks size={15} />, disabled: false, onClick: onTimeline, show: shows("timeline") },
    offlinePayment: { label: "Offline Payment", icon: <Wallet size={15} />, disabled: true, onClick: undefined, show: shows("offlinePayment") },
    invoice: { label: "Row Selection Preview", icon: <Network size={15} />, disabled: !hasSelection, onClick: onInvoice, show: shows("invoice") },
    download: { label: "Download Data", icon: <Download size={15} />, disabled: false, onClick: onDownload, show: shows("download") },
    externalDevice: { label: "External Device Info", icon: <HardDrive size={15} />, disabled: !isSingleSelection, onClick: onExternalDeviceInfo, show: shows("externalDevice") },
    filter: { label: "Filter Datatable", icon: <SlidersHorizontal size={15} />, disabled: false, onClick: onFilter, show: shows("filter") },
    add: { label: "Add License", icon: <Plus size={15} />, disabled: false, onClick: onAdd, show: shows("add") },
    edit: { label: "Edit", icon: <Pencil size={15} />, disabled: !isSingleSelection, onClick: onEdit, show: shows("edit") },
    delete: { label: "Delete", icon: <Trash2 size={15} />, disabled: !hasSelection, onClick: onDelete, danger: true, show: shows("delete") },
  };

  // Default order falls back to the dict's own (insertion) order, which
  // matches the original hardcoded array exactly.
  const mobileActionsList = (order ?? Object.keys(mobileActionDefs))
    .map((key) => mobileActionDefs[key])
    .filter(Boolean);

  const desktopButtons = {
    view: shows("view") && <IconButton key="view" icon={<Eye size={16} />} label="View Details" disabled={!isSingleSelection} onClick={onViewDetails} />,
    property: shows("property") && <IconButton key="property" icon={<Tag size={16} />} label="Update Property" disabled={!isSingleSelection} onClick={onUpdateProperty} />,
    activate: shows("activate") && <IconButton key="activate" icon={<Check size={16} />} label="Activate" disabled={!hasSelection} onClick={onActivate} />,
    deactivate: shows("deactivate") && <IconButton key="deactivate" icon={<UserCog size={16} />} label="Deactivate" disabled={!hasSelection} onClick={onDeactivate} />,
    renewal: shows("renewal") && <IconButton key="renewal" icon={<Diamond size={16} />} label="License Renewal" disabled={!isSingleSelection} onClick={onRenewal} />,
    history: shows("history") && <IconButton key="history" icon={<Briefcase size={16} />} label="Get History Pi And Invoice" disabled={!isSingleSelection} onClick={onHistory} />,
    timeline: shows("timeline") && <IconButton key="timeline" icon={<ListChecks size={16} />} label="Timeline" disabled={false} onClick={onTimeline} />,
    offlinePayment: shows("offlinePayment") && <IconButton key="offlinePayment" icon={<Wallet size={16} />} label="Offline payment" disabled />,
    invoice: shows("invoice") && <IconButton key="invoice" icon={<Network size={16} />} label="Row Selection Preview" disabled={!hasSelection} onClick={onInvoice} />,
    download: shows("download") && <IconButton key="download" icon={<Download size={16} />} label="Download" disabled={false} onClick={onDownload} />,
    externalDevice: shows("externalDevice") && <IconButton key="externalDevice" icon={<HardDrive size={16} />} label="External Device Info" disabled={!isSingleSelection} onClick={onExternalDeviceInfo} />,
    add: shows("add") && <IconButton key="add" icon={<Plus size={16} />} label="Add License" onClick={onAdd} />,
    edit: shows("edit") && <IconButton key="edit" icon={<Pencil size={16} />} label="Edit" disabled={!isSingleSelection} onClick={onEdit} />,
    delete: shows("delete") && <IconButton key="delete" icon={<Trash2 size={16} />} label="Delete" variant="danger" disabled={!hasSelection} onClick={onDelete} />,
    filter: shows("filter") && <IconButton key="filter" icon={<SlidersHorizontal size={16} />} label="Filter Datatable" onClick={onFilter} />,
  };

  // A separator is only meaningful between two groups that both rendered
  // something, so groups are assembled first and joined afterwards. A custom
  // `order` collapses everything into one flat, undivided group instead.
  const desktopGroups = (
    order
      ? [order.map((key) => desktopButtons[key])]
      : [
          [desktopButtons.view, desktopButtons.property],
          [desktopButtons.activate, desktopButtons.deactivate],
          [desktopButtons.renewal, desktopButtons.history, desktopButtons.timeline],
          [desktopButtons.offlinePayment, desktopButtons.invoice, desktopButtons.download, desktopButtons.externalDevice],
          [desktopButtons.add, desktopButtons.edit, desktopButtons.delete],
          [desktopButtons.filter],
        ]
  )
    .map((group) => group.filter(Boolean))
    .filter((group) => group.length > 0);

  return (
    <div className={cn("w-full shrink-0 flex flex-col gap-2", className)}>
      {/* Desktop Grouped View (sm: and above) */}
      <div className="hidden sm:flex flex-wrap items-center gap-1.5 max-w-full overflow-hidden">
        {desktopGroups.map((group, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 && <div className="h-4 w-px bg-card-border/80 mx-0.5 shrink-0" />}
            <div className="flex items-center gap-1">{group}</div>
          </React.Fragment>
        ))}
      </div>

      {/* Mobile View (< 640px) */}
      <div className="flex sm:hidden flex-col gap-2 w-full">
        <div className="flex items-center justify-between gap-1.5 w-full">
          <div className="flex items-center gap-1.5">
            {hasSelection ? (
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-accent/15 text-accent border border-accent/30">
                  {selectedCount} selected
                </span>
                {shows("edit") && isSingleSelection && (
                  <IconButton icon={<Pencil size={16} />} label="Edit" onClick={onEdit} />
                )}
                {shows("delete") && hasSelection && (
                  <IconButton icon={<Trash2 size={16} />} label="Delete" variant="danger" onClick={onDelete} />
                )}
              </div>
            ) : (
              shows("add") && <IconButton icon={<Plus size={16} />} label="Add License" onClick={onAdd} />
            )}
          </div>

          {/* Toggle Button for Mobile Drawer — ALWAYS visible */}
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-label={expanded ? "Collapse actions" : "Expand actions"}
            className={cn(
              "flex h-control-lg items-center gap-1 rounded-control border px-2.5 text-body-sm font-semibold transition-all cursor-pointer select-none shrink-0",
              expanded
                ? "border-accent bg-accent-muted/40 text-accent shadow-sm"
                : "border-card-border bg-card text-ink-secondary hover:text-ink-primary hover:border-accent/40"
            )}
          >
            <span>More Actions</span>
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        {/* Mobile Expanded Drawer with Clear Text Labels and All Options */}
        {expanded && (
          <div className="grid grid-cols-2 gap-1.5 rounded-surface border border-card-border bg-card p-2.5 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
            {mobileActionsList
              .filter((a) => a.show)
              .map((action, idx) => (
                <button
                  key={idx}
                  type="button"
                  disabled={action.disabled}
                  onClick={() => {
                    if (!action.disabled && action.onClick) {
                      action.onClick();
                      setExpanded(false);
                    }
                  }}
                  className={cn(
                    "flex min-h-control-lg items-center gap-2 rounded-control border px-2.5 py-2 text-body-sm font-medium transition-colors select-none text-left w-full truncate",
                    action.disabled
                      ? "border-card-border/40 bg-input/20 text-ink-muted/50 cursor-not-allowed opacity-60"
                      : action.danger
                        ? "border-status-offline/30 bg-status-offline/5 text-status-offline hover:bg-status-offline/15 active:bg-status-offline/25 cursor-pointer"
                        : "border-card-border/80 bg-input/60 text-ink-primary hover:border-accent/60 hover:bg-accent-muted/20 active:bg-accent-muted/40 cursor-pointer"
                  )}
                >
                  <span className={cn("shrink-0", action.danger ? "text-status-offline" : "text-accent")}>
                    {action.icon}
                  </span>
                  <span className="truncate">{action.label}</span>
                </button>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
