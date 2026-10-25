import * as React from "react";

/** Named steps on the shared column width scale. */
export type ColumnSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface DataTableColumn<T = any> {
  key: string;
  header: string | React.ReactNode;
  /** Preferred: a step on the shared width scale, so columns line up across pages. */
  size?: ColumnSize;
  /** Snapped up to the nearest step on the scale. */
  width?: string | number;
  /** Treated as a floor and snapped up to the nearest step. */
  minWidth?: string | number;
  sortable?: boolean;
  align?: "left" | "center" | "right";
  render?: (row: T) => React.ReactNode;
  truncate?: boolean;
  isLink?: boolean;
  copyable?: boolean;
  isCopyable?: boolean;
  onCellClick?: (row: T, key: string, e: React.MouseEvent) => void;
}

export interface DataTableProps<T = any> {
  /** Array of column definitions */
  columns?: DataTableColumn<T>[];
  /** Array of data items to display */
  data?: T[];
  /** Function returning unique key for each row */
  rowKey?: (row: T, index?: number) => string | number;
  /** Show loading spinner */
  loading?: boolean;
  /** Empty state message */
  emptyMessage?: string;
  /** Optional action shown when the table has no matching records. */
  onClearFilters?: () => void;
  /** Infer columns from the first data row when explicit columns are omitted. */
  autoColumns?: boolean;
  /** Keys of visible columns */
  visibleColumns?: string[];
  /** Active sort key */
  sortKey?: string;
  /** Active sort direction */
  sortDirection?: "asc" | "desc" | null;
  /** Callback when column sort is toggled */
  onSortChange?: (key: string, direction: "asc" | "desc" | null) => void;
  /** Enable row selection checkboxes */
  selectable?: boolean;
  /**
   * How many rows may be selected at once. Read by `MobileTableWrapper`'s card
   * list only — the desktop table has always selected many and still does.
   *
   * `"single"` replaces the selection on each pick, and a plain tap selects.
   * `"multiple"` (the default) appends: a long press arms selection mode, then
   * taps add to it.
   */
  selectionMode?: "single" | "multiple";
  /** Keys of currently selected rows */
  selectedKeys?: (string | number)[];
  /** Callback when row selection changes */
  onSelectedKeysChange?: (keys: (string | number)[]) => void;
  /** Callback when a row is clicked */
  onRowClick?: (row: T) => void;
  /** Callback when a row is right-clicked */
  onContextMenu?: (row: T, e: React.MouseEvent) => void;
  /** Custom context menu items displayed on right-click */
  contextMenuItems?: Array<{
    label: string;
    icon?: React.ReactNode;
    onClick?: (row: T) => void;
    danger?: boolean;
  }>;
  /** Enable sticky header when scrolling. Default true. */
  stickyHeader?: boolean;
  /** Alternating row background stripes. Default false. */
  striped?: boolean;
  /** Show the selected-row bulk action bar. Default true. */
  showFloatingBar?: boolean;
  /** Enable interactive desktop column width drag-resizing. Default true. */
  resizableColumns?: boolean;
  /** Custom wrapper CSS class */
  className?: string;
  /** Enable mobile screen adaptive card layout (<768px). Default true. */
  responsive?: boolean;
  /** Render cell text on multiple lines instead of truncating it. */
  textWrap?: "truncate" | "wrap";
  /** Force truncation for cell values. */
  truncateText?: boolean;
  /** Enable server-side data binding mode */
  serverSide?: boolean;
  /** Error message or object when server request fails */
  error?: any;
  /** Callback to retry server request */
  onRetry?: () => void;
  /** Where header labels sit. "auto" follows each column's own `align`, else centres. Default "auto". */
  headerAlign?: "auto" | "left" | "center" | "right";
  /** Tints a whole row by meaning. Return null for rows needing no highlight. */
  getRowTone?: (row: T, index: number) => RowTone | null | undefined;
}

/** Row tints, named by meaning so they follow the active theme. */
export type RowTone = "warn" | "danger" | "success" | "info";

export declare const DataTable: React.FC<DataTableProps>;

export interface DropdownOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface DropdownProps {
  label?: string;
  required?: boolean;
  error?: string;
  options?: DropdownOption[];
  fetchOptions?: (query: string) => Promise<DropdownOption[] | { options: DropdownOption[] }>;
  value?: string | number;
  onChange?: (value: any) => void;
  placeholder?: string;
  searchable?: boolean;
  disabled?: boolean;
  className?: string;
}

export declare const Dropdown: React.FC<DropdownProps>;

export interface PaginationProps {
  page?: number;
  pageSize?: number;
  total?: number;
  onPageChange?: (page: number) => void;
  /** Called when the optional page-size selector changes. */
  onPageSizeChange?: (pageSize: number) => void;
  /** Page-size values offered by the optional selector. */
  pageSizeOptions?: number[];
  /** Show the page-size selector. Default false for backwards-compatible UI. */
  showPageSizeSelector?: boolean;
  className?: string;
}

export declare const Pagination: React.FC<PaginationProps>;

export interface ThemeProviderProps {
  children?: React.ReactNode;
  theme?: string;
  defaultTheme?: string;
  onThemeChange?: (theme: string) => void;
  /** Set false to scope token changes to this provider instead of document.documentElement. */
  global?: boolean;
}

export declare const ThemeProvider: React.FC<ThemeProviderProps>;
export declare const ThemeSwitcher: React.FC;

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "add" | "cancel";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
}
export declare const Button: React.ForwardRefExoticComponent<ButtonProps & React.RefAttributes<HTMLButtonElement>>;

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  label: string;
  variant?: "idle" | "active" | "danger";
  size?: "xs" | "sm" | "md";
}
export declare const IconButton: React.ForwardRefExoticComponent<IconButtonProps & React.RefAttributes<HTMLButtonElement>>;

export interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
  requiredText?: React.ReactNode;
  error?: React.ReactNode;
  hint?: React.ReactNode;
  icon?: React.ReactNode;
}
export declare const InputField: React.ForwardRefExoticComponent<InputFieldProps & React.RefAttributes<HTMLInputElement>>;

export interface DateRangeValue {
  from: Date | string | number | null;
  to: Date | string | number | null;
}
export interface DateRangePickerProps {
  label?: React.ReactNode;
  required?: boolean;
  requiredText?: React.ReactNode;
  error?: React.ReactNode;
  value?: DateRangeValue | string;
  onChange?: (value: DateRangeValue) => void;
  disablePastDates?: boolean;
  className?: string;
}
export declare const DateRangePicker: React.FC<DateRangePickerProps>;

export interface DatePickerProps {
  label?: React.ReactNode;
  required?: boolean;
  requiredText?: React.ReactNode;
  error?: React.ReactNode;
  value?: string;
  onChange?: (value: string) => void;
  showTime?: boolean;
  type?: React.HTMLInputTypeAttribute;
  iconPosition?: "left" | "right";
  min?: string;
  max?: string;
  disabled?: boolean;
  disablePastDates?: boolean;
  className?: string;
}
export declare const DatePicker: React.FC<DatePickerProps>;
export declare const DayDatePicker: React.FC<DatePickerProps>;

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  children?: React.ReactNode;
  className?: string;
}
export declare const Modal: React.FC<ModalProps>;
export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular";
}
export declare const Skeleton: React.FC<SkeletonProps>;

export interface SkeletonCardProps {
  className?: string;
}
export declare const SkeletonCard: React.FC<SkeletonCardProps>;

export interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  className?: string;
}
export declare const SkeletonTable: React.FC<SkeletonTableProps>;

export interface ToastOptions {
  tone?: "info" | "success" | "error" | "warn";
  duration?: number;
}

export interface ToastAPI {
  (message: string, options?: ToastOptions): string;
  show: (message: string, options?: ToastOptions) => string;
  success: (message: string, options?: ToastOptions) => string;
  error: (message: string, options?: ToastOptions) => string;
  warn: (message: string, options?: ToastOptions) => string;
  info: (message: string, options?: ToastOptions) => string;
  dismiss: (id: string) => void;
}

export declare const ToastProvider: React.FC<{ children?: React.ReactNode }>;
export declare function useToast(): ToastAPI;
export declare const Toast: React.FC<any>;
export declare const ToastItem: React.FC<any>;

export declare function exportToCSV(data: any[], columns?: DataTableColumn[], filename?: string): void;
export declare function exportToJSON(data: any[], filename?: string): void;

export interface BreadcrumbItem {
  key?: string;
  label: string;
  href?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
}

export interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  separator?: React.ReactNode;
  showHomeIcon?: boolean;
  className?: string;
}

export declare const Breadcrumbs: React.FC<BreadcrumbsProps>;

export declare const demoColumns: DataTableColumn[];
export declare const demoData: any[];
export declare const demoDataTableProps: DataTableProps;
export declare const demoPaginationProps: PaginationProps;
export declare const demoDropdownProps: DropdownProps;

// Server-Side Data Binding Declarations
export interface ServerDataParams {
  page: number;
  pageSize: number;
  sortKey?: string | null;
  sortDirection?: "asc" | "desc" | null;
  search?: string;
  filters?: Record<string, any>;
}

export interface ServerDataResult<T = any> {
  data: T[];
  total: number;
  page?: number;
  pageSize?: number;
  pageCount?: number;
}

export interface UseServerDataBindingOptions<T = any> {
  fetcher: (params: ServerDataParams) => Promise<ServerDataResult<T> | T[]>;
  initialPage?: number;
  initialPageSize?: number;
  initialSortKey?: string | null;
  initialSortDirection?: "asc" | "desc" | null;
  initialSearch?: string;
  initialFilters?: Record<string, any>;
  debounceMs?: number;
  autoFetch?: boolean;
  onSuccess?: (result: any) => void;
  onError?: (error: any) => void;
}

export interface UseServerDataBindingReturn<T = any> {
  data: T[];
  total: number;
  page: number;
  setPage: (page: number) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  pageCount: number;
  sortKey: string | null;
  sortDirection: "asc" | "desc" | null;
  setSort: (key: string | null, direction: "asc" | "desc" | null) => void;
  search: string;
  setSearch: (query: string) => void;
  filters: Record<string, any>;
  setFilters: (filters: Record<string, any>) => void;
  setFilter: (key: string, value: any) => void;
  loading: boolean;
  error: any;
  refetch: () => Promise<void>;
  fetchParams: ServerDataParams;
  tableProps: {
    data: T[];
    loading: boolean;
    sortKey: string | null;
    sortDirection: "asc" | "desc" | null;
    onSortChange: (key: string, dir: "asc" | "desc" | null) => void;
    serverSide: boolean;
    error: any;
    onRetry: () => void;
  };
  paginationProps: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
  };
}

export declare function useServerDataBinding<T = any>(
  options: UseServerDataBindingOptions<T>
): UseServerDataBindingReturn<T>;

export interface ServerDataTableProps<T = any> extends DataTableProps<T> {
  fetcher: (params: ServerDataParams) => Promise<ServerDataResult<T> | T[]>;
  initialPage?: number;
  initialPageSize?: number;
  initialSortKey?: string | null;
  initialSortDirection?: "asc" | "desc" | null;
  initialSearch?: string;
  initialFilters?: Record<string, any>;
  showSearch?: boolean;
  searchPlaceholder?: string;
  showPagination?: boolean;
  toolbarActions?: React.ReactNode;
}

export declare const ServerDataTable: React.FC<ServerDataTableProps>;

export interface AsyncDropdownProps {
  loadOptions: (query: string) => Promise<DropdownOption[] | { options: DropdownOption[] }>;
  value?: string | number | null;
  onChange?: (value: any, option: DropdownOption | null) => void;
  label?: string;
  placeholder?: string;
  debounceMs?: number;
  disabled?: boolean;
  className?: string;
}

export declare const AsyncDropdown: React.FC<AsyncDropdownProps>;

export interface AsyncMultiSelectDropdownProps {
  loadOptions: (query: string) => Promise<DropdownOption[] | { options: DropdownOption[] }>;
  value?: (string | number)[];
  onChange?: (values: (string | number)[]) => void;
  label?: string;
  placeholder?: string;
  debounceMs?: number;
  disabled?: boolean;
  className?: string;
}

export declare const AsyncMultiSelectDropdown: React.FC<AsyncMultiSelectDropdownProps>;

export interface RestAdapterConfig {
  baseUrl?: string;
  endpoint?: string;
  headers?: Record<string, string>;
  formatParams?: (params: ServerDataParams, defaultParams: Record<string, string>) => Record<string, string>;
  parseResponse?: (json: any) => ServerDataResult;
}

export declare function createRestAdapter(
  config: RestAdapterConfig
): (params: ServerDataParams) => Promise<ServerDataResult>;

export interface MutationAdapterConfig {
  baseUrl?: string;
  endpoint?: string;
  headers?: Record<string, string>;
  method?: "PUT" | "PATCH";
  getId?: (entity: any) => string | number;
  parseResponse?: (json: any) => any;
}

export declare function createCreateAdapter(
  config: MutationAdapterConfig
): (payload: any) => Promise<any>;

export declare function createUpdateAdapter(
  config: MutationAdapterConfig
): (entityOrId: any, payload: any) => Promise<any>;

export declare function createDeleteAdapter(
  config: MutationAdapterConfig
): (entityOrId: any) => Promise<any>;

export declare function fetchServerData(
  url: string,
  queryParams?: Record<string, any>,
  fetchOptions?: RequestInit
): Promise<any>;

export interface MockServerOptions {
  delayMs?: number;
  failureRate?: number;
  searchFields?: string[];
}

export declare function createMockServerHandler(
  dataset: any[],
  options?: MockServerOptions
): (params: ServerDataParams) => Promise<ServerDataResult>;

export declare const ServerSidePage: React.FC<{ onToast?: (msg: string) => void }>;

export interface ServerDataProviderProps {
  baseUrl?: string;
  headers?: Record<string, string>;
  endpoints?: {
    licenses?: string;
    users?: string;
    licenseTypes?: string;
    licenseTerms?: string;
    productTypes?: string;
    [key: string]: string | undefined;
  };
  fetcher?: (config: { endpointKey: string; endpoint: string; params: ServerDataParams }) => Promise<ServerDataResult>;
  mutator?: (config: { endpointKey: string; endpoint: string; method: string; payload?: any; id?: any }) => Promise<any>;
  children?: React.ReactNode;
}

export declare const ServerDataProvider: React.FC<ServerDataProviderProps>;
export declare function useServerDataContext(): any;

export interface EnterprisePageServerProps<T = any> {
  fetcher?: (params: ServerDataParams) => Promise<ServerDataResult<T>>;
  serverSide?: boolean;
  onCreate?: (data: any) => Promise<void> | void;
  onUpdate?: (item: T, data: any) => Promise<void> | void;
  onDelete?: (item: T) => Promise<void> | void;
  initialData?: T[];
  onToast?: (msg: string) => void;
}

export declare const LicensePage: React.FC<EnterprisePageServerProps>;
export declare const UsersPage: React.FC<EnterprisePageServerProps>;

export interface MasterListPageProps<T = any> extends EnterprisePageServerProps<T> {
  title?: string;
  items?: T[];
  setItems?: React.Dispatch<React.SetStateAction<T[]>>;
  columns?: DataTableColumn<T>[];
  FormModal?: React.ComponentType<any>;
  addLabel?: string;
  showStatusToggle?: boolean;
  endpointKey?: string;
}

export declare const MasterListPage: React.FC<MasterListPageProps>;

export interface CopyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
  value?: string;
  label?: string;
  onCopy?: (copiedText: string) => void;
  size?: number;
  tooltipText?: string;
  copiedText?: string;
  className?: string;
}

export declare const CopyButton: React.FC<CopyButtonProps>;

export interface CopyableTextProps {
  text: string;
  truncate?: boolean;
  className?: string;
  size?: number;
}

export declare const CopyableText: React.FC<CopyableTextProps>;

export interface TruncatedTextProps extends React.HTMLAttributes<HTMLElement> {
  text?: string | number;
  children?: React.ReactNode;
  maxLength?: number;
  showTooltip?: boolean;
  tooltipPosition?: "top" | "bottom" | "left" | "right";
  className?: string;
  as?: React.ElementType;
}

export declare const TruncatedText: React.FC<TruncatedTextProps>;
export declare const EllipsisText: React.FC<TruncatedTextProps>;
export declare const Ellipsis: React.FC<TruncatedTextProps>;





/** Declarations for the complete public API. Detailed props are added incrementally without withholding runtime exports from TypeScript consumers. */
export type PublicComponent = React.ComponentType<any>;
export declare const ActivateLicenseModal: PublicComponent;
export declare const AuthLayout: PublicComponent;
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: "neutral" | "online" | "warn" | "offline" | "live" | "accent";
  /**
   * Corner radius. `"pill"` (the default) for a status badge; `"control"`
   * for the softly-rectangular radius the scale gives buttons, inputs and
   * tags — the right step for a badge carrying a figure rather than a state.
   *
   * A prop rather than a `className` override because `cn` does no
   * tailwind-merge: a radius passed through `className` would not replace
   * this one, it would sit alongside it and let stylesheet order decide.
   */
  shape?: "pill" | "control";
}

export declare const Badge: React.FC<BadgeProps>;
export declare const BottomSheet: PublicComponent;
export declare const CancelPiModal: PublicComponent;
export declare const Card: PublicComponent;
export declare const ChangePasswordModal: PublicComponent;
export declare const ChangesPreviewModal: PublicComponent;
export declare const Checkbox: PublicComponent;
export declare const ColumnFilterDropdown: PublicComponent;
export declare const ConfirmDialog: PublicComponent;
export declare const DeactivateLicenseModal: PublicComponent;
export declare const DeleteLicenseModal: PublicComponent;
export declare const DynamicRowList: PublicComponent;
export declare const ExcelPreviewViewer: PublicComponent;
export declare const FilterPanel: PublicComponent;
export declare const FloatingAddButton: PublicComponent;
export declare const Footer: PublicComponent;
export declare const FormGroup: PublicComponent;
export declare const FormModal: PublicComponent;
export declare const Header: PublicComponent;
export declare const HistoryPiInvoiceModal: PublicComponent;
export declare const HomeDashboard: PublicComponent;
export declare const InputGroup: PublicComponent;
export declare const InvoicePdfViewer: PublicComponent;
export declare const InvoicePreviewModal: PublicComponent;
export declare const LicenseAgentButton: PublicComponent;
export declare const LicenseFilter: PublicComponent;
export declare const LicenseFormModal: PublicComponent;
export declare const LicenseRenewalModal: PublicComponent;
export declare const LicenseTermFormModal: PublicComponent;
export declare const LicenseTermPage: PublicComponent;
export declare const LicenseToolbar: PublicComponent;
export declare const LicenseTrendChart: PublicComponent;
export declare const LicenseTypeFormModal: PublicComponent;
export declare const LicenseTypePage: PublicComponent;
export declare const Loader: PublicComponent;

export declare const MainLayout: PublicComponent;
export declare const ManageRenewalStreamModal: PublicComponent;
export declare const MobileCardList: PublicComponent;
export declare const MobileTableWrapper: PublicComponent;
export declare const MobileViewControls: PublicComponent;

export interface MobileTableToolbarAction {
  /** Falls back to `label` when omitted. */
  key?: string;
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  /** Renders in the destructive (red) treatment. */
  danger?: boolean;
  /** Only shown while exactly one row is selected (e.g. Edit). */
  requiresSingle?: boolean;
}

export interface MobileTableToolbarProps {
  searchValue?: string;
  /** The search field only renders when this is supplied. */
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  hideSearch?: boolean;
  /** Content of the filter sheet — e.g. `useResourceFilters`'s `mobileFilterOptions`. The button only renders when this is supplied. */
  filterOptions?: React.ReactNode;
  /** Drives the count badge on the filter button. */
  activeFilterCount?: number;
  /** Sort renders only when both this and `onSortSelect` are supplied. */
  sortOptions?: Array<{ value: string; label: string }>;
  currentSort?: string | null;
  onSortSelect?: (value: string) => void;
  /** Pair with `MobileTableWrapper`'s `viewMode`/`onViewModeChange`. */
  viewMode?: "card" | "table";
  onViewModeChange?: (mode: "card" | "table") => void;
  /** Above zero, the contextual action bar replaces the controls row. */
  selectedCount?: number;
  onClearSelection?: () => void;
  selectionActions?: MobileTableToolbarAction[];
  /**
   * Always visible beside filter/sort/view, regardless of selection — for a
   * page-level action (Reload, Download) with no per-row scope, so nothing
   * on desktop for `selectedCount > 0` to reveal it behind.
   */
  toolbarActions?: MobileTableToolbarAction[];
  /** Rendered on its own row underneath, so it keeps full width on a phone. */
  pagination?: React.ReactNode;
  className?: string;
}

/** The shared mobile toolbar for a table screen: search, filter, sort, view toggle, pagination, and a contextual selection bar. */
export declare const MobileTableToolbar: React.FC<MobileTableToolbarProps>;

export interface MobileSelectionBarAction {
  /** Falls back to `label` when omitted. */
  key?: string;
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  /** Renders in the destructive (red) treatment. */
  danger?: boolean;
  /** Only shown while exactly one row is selected (e.g. Edit). */
  requiresSingle?: boolean;
}

export interface MobileSelectionBarProps {
  /** Renders nothing at or below zero. */
  count?: number;
  /** The trailing clear action. Omit to render no way out of selection mode. */
  onClear?: () => void;
  /** Label beside the clear action's X. Defaults to "Deselect". */
  clearLabel?: string;
  /** Rendered before the clear action, in the order given. */
  actions?: MobileSelectionBarAction[];
  className?: string;
}

/**
 * The floating "N selected" pill for a mobile table screen. Hugs its contents
 * and stays clear of a `FloatingAddButton`, so the count and its actions read
 * as one bar rather than being pushed to opposite edges.
 */
export declare const MobileSelectionBar: React.FC<MobileSelectionBarProps>;
export declare const MultiSelectDropdown: PublicComponent;
export declare const Panel: PublicComponent;
export declare const PasswordInput: PublicComponent;
export declare const PasswordStrengthMeter: PublicComponent;
export declare const PermissionEditor: PublicComponent;
export declare const ProductTypeFormModal: PublicComponent;
export declare const ProductTypePage: PublicComponent;
export declare const ProfileActions: PublicComponent;
export declare const ProfileMenu: PublicComponent;
export declare const RenewalStreamFormModal: PublicComponent;
export declare const ReportFilter: PublicComponent;
export declare const ReportPage: PublicComponent;
export declare const ReportTablePanel: PublicComponent;
export declare const ReportWidget: PublicComponent;
export declare const RowSelectCheckbox: PublicComponent;
export declare const SearchBox: PublicComponent;
export declare const SegmentedControl: PublicComponent;
export declare const SelectionRowPreviewModal: PublicComponent;
export declare const Sidebar: PublicComponent;
export declare const SingleLicensePreviewModal: PublicComponent;
export declare const SlideOverModal: PublicComponent;
export declare const SlsReportDashboard: PublicComponent;
export declare const TableToolbar: PublicComponent;
export declare const Tabs: PublicComponent;
export declare const TimelineModal: PublicComponent;
export declare const ThemeProvider: React.FC<{
  theme?: string;
  onThemeChange?: (theme: string) => void;
  children?: any;
}>;
export declare const ToggleButtonGroup: PublicComponent;
export declare const Tooltip: PublicComponent;
export declare const UpcomingRenewalChart: PublicComponent;
export declare const UpdatePropertyModal: PublicComponent;
export declare const UserFormModal: PublicComponent;
export declare const UserProfilePage: PublicComponent;
export declare const UsersFilter: PublicComponent;
export declare const ValidateTicketModal: PublicComponent;
export declare const ValidationMessage: PublicComponent;
export declare const CSS_VAR_MAP: Record<string, string>;
export declare const DEFAULT_SIDEBAR_ITEMS: unknown[];
export declare const DEFAULT_THEME: string;
export declare const THEMES: Record<string, Record<string, unknown>>;
export declare const THEME_ALIASES: Record<string, string>;
export declare const applyTheme: any;
export declare const cn: any;
export declare const demoSidebarProps: any;
export declare const makeInitialLicenseTerms: any;
export declare const makeInitialLicenseTypes: any;
export declare const makeInitialLicenses: any;
export declare const makeInitialProductTypes: any;
export declare const makeInitialReports: any;
export declare const makeInitialTimeline: any;
export declare const makeInitialUsers: any;
export declare const makeLicenseTrendData: any;
export declare const makeMaterialsData: any;
export declare const makeUpcomingRenewalData: any;
export declare const resolveThemeKey: any;
export declare const useTheme: any;

// ── Column width scale ───────────────────────────────────────────────────────

export declare const COLUMN_SIZES: Record<ColumnSize, number>;
export declare const DEFAULT_COLUMN_WIDTH: number;
/** Rounds a width up to the next step on the scale, or null if not a pixel value. */
export declare function snapColumnWidth(value: string | number | null | undefined): number | null;
/** The pixel width a column should render at: `size`, then `width`, then `minWidth`. */
export declare function resolveColumnWidth(col: DataTableColumn | null | undefined, fallback?: number): number;

// ── Licence expiry ───────────────────────────────────────────────────────────

export type LicenseLifecycleState =
  | "active"
  | "expiring"
  | "expired"
  | "deactivated"
  | "unknown";

export interface LicenseLifecycle {
  state: LicenseLifecycleState;
  /** Whole calendar days until expiry; negative once passed, null if unknown. */
  days: number | null;
  date: Date | null;
  label: string;
  tone: "online" | "warn" | "offline" | "neutral";
}

export declare const DEFAULT_WARN_WITHIN_DAYS: number;
/** Parses the dd-MMM-yyyy / dd-MMM-yy / ISO text this data stores. Null if unparseable. */
export declare function parseLicenseDate(value: unknown): Date | null;
export declare function daysUntil(date: Date | null, now?: Date): number | null;
export declare function getLicenseLifecycle(
  row: { status?: string; expiry?: string } | null | undefined,
  options?: { now?: Date; warnWithinDays?: number }
): LicenseLifecycle;
export declare function describeTimeLeft(days: number | null): string;
export declare function describeExpiry(
  row: { status?: string; expiry?: string } | null | undefined,
  options?: { now?: Date; warnWithinDays?: number }
): string;
export declare function formatLicenseDate(date: Date | null): string;

export interface LicenseStatusCellProps {
  row: { status?: string; expiry?: string };
  /** How many days out counts as "about to expire". Default 30. */
  warnWithinDays?: number;
  now?: Date;
  showTooltip?: boolean;
  className?: string;
}

/** The STATUS cell of the licence table: shows a countdown once expiry is near. */
export declare const LicenseStatusCell: React.FC<LicenseStatusCellProps>;
/** Row tone companion to LicenseStatusCell — "warn" for rows about to expire. */
export declare function getLicenseRowTone(
  row: { status?: string; expiry?: string },
  options?: { now?: Date; warnWithinDays?: number }
): "warn" | null;

// â”€â”€ Plumbing â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface ApiClientConfig {
  /** Origin of the API. Empty string means same-origin. */
  baseUrl?: string;
  /** Storage key the session id is persisted under. */
  tokenStorageKey?: string;
  /** Defaults to window.localStorage. */
  storage?: Storage;
}

export interface ApiRequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
  /** Send no Authorization header. */
  skipAuth?: boolean;
  signal?: AbortSignal;
}

export interface ApiClient {
  configure(config: ApiClientConfig): ApiClient;
  readonly baseUrl: string;
  readonly tokenStorageKey: string;
  getToken(): string | null;
  setToken(token: string | null): void;
  clearToken(): void;
  /** Subscribes to "the server rejected this session". Returns an unsubscribe. */
  onUnauthorized(listener: (message: string) => void): () => void;
  request<T = any>(path: string, options?: ApiRequestOptions): Promise<T>;
}

export declare class ApiError extends Error {
  name: "ApiError";
  /** HTTP transport status. */
  status?: number;
  /** Status reported inside the response envelope, when it carries one. */
  statusCode?: number;
  errors: string[];
  constructor(message: string, init?: { status?: number; errors?: string[]; statusCode?: number });
}

export declare function createApiClient(config?: ApiClientConfig): ApiClient;
/** Points the shared client at a backend. Call once, before rendering. */
export declare function configureApiClient(config: ApiClientConfig): ApiClient;
export declare function getApiClient(): ApiClient;
export declare function apiRequest<T = any>(path: string, options?: ApiRequestOptions): Promise<T>;
export declare function onUnauthorized(listener: (message: string) => void): () => void;
export declare function getStoredSessionId(): string | null;
export declare function setStoredSessionId(sessionId: string | null): void;
export declare function clearStoredSessionId(): void;

export interface AuthRoutes {
  login: string;
  logout: string;
  session: string;
  changePassword: string;
}

export declare const DEFAULT_AUTH_ROUTES: AuthRoutes;

export interface AuthService {
  login(username: string, password: string): Promise<{ sessionId: string; raw: any }>;
  logout(): Promise<void>;
  /** Null when nothing is stored, so this doubles as a silent "am I signed in?". */
  getSession(): Promise<any | null>;
  changePassword(newPassword: string, currentPassword?: string): Promise<any>;
}

export declare function createAuthService(config?: {
  client?: ApiClient;
  routes?: Partial<AuthRoutes>;
}): AuthService;

export declare const authService: AuthService;
export declare function login(username: string, password: string): Promise<{ sessionId: string; raw: any }>;
export declare function logout(): Promise<void>;
export declare function getSession(): Promise<any | null>;
export declare function changePassword(newPassword: string, currentPassword?: string): Promise<any>;

export type AuthStatus = "checking" | "authenticated" | "unauthenticated";

export interface AuthContextValue {
  status: AuthStatus;
  user: any;
  /** True only during the first session check on load. */
  checking: boolean;
  /** Set when the server ended the session, not when the user signed out. */
  expiredMessage: string | null;
  login(username: string, password: string): Promise<void>;
  logout(): Promise<void>;
  clearExpiredMessage(): void;
}

export interface AuthProviderProps {
  children?: React.ReactNode;
  authService?: AuthService;
  /** How often to re-check the session while signed in. Default 30000. */
  sessionCheckIntervalMs?: number;
  expiredMessage?: string;
}

export declare const AuthProvider: React.FC<AuthProviderProps>;
export declare function useAuth(): AuthContextValue;

export interface ResourceListParams {
  page?: number;
  pageSize?: number;
  sortKey?: string;
  sortDirection?: "asc" | "desc";
  search?: string;
  filters?: Record<string, string | string[]>;
}

export interface ResourceService<T = any, K = string | number> {
  path: string;
  idKey: string;
  /** Whether this service is currently serving demo records. */
  isDemo(): boolean;
  list(params?: ResourceListParams): Promise<{ items: T[]; total: number }>;
  /** The values a column actually holds, for a filter dropdown. */
  distinct(field: string): Promise<string[]>;
  create(payload: Partial<T>): Promise<T>;
  update(id: K, payload: Partial<T>): Promise<T>;
  remove(id: K): Promise<any>;
  /** Extra properties ride along in the request body too (e.g. a ticket number), same as `removeMany`'s `payload`. */
  updateMany(ids: K[], payload: Partial<T> & Record<string, unknown>): Promise<any>;
  /** `payload` rides along in the request body (e.g. a deletion reason or ticket number). */
  removeMany(ids: K[], payload?: Record<string, unknown>): Promise<any>;
}

export declare function createResourceService<T = any, K = string | number>(config: {
  path: string;
  demoData?: T[];
  idKey?: string;
  label?: string;
  client?: ApiClient;
  /** Never call the backend at all. */
  forceDemo?: boolean;
  /** Let failures surface instead of falling back to demo records. */
  disableFallback?: boolean;
}): ResourceService<T, K>;

export interface ResourceBinding<T = any, K = string | number> {
  data: T[];
  loading: boolean;
  error: string | null;
  isDemo: boolean;
  refetch(): Promise<void>;
  create(payload: Partial<T>): Promise<T>;
  update(id: K, payload: Partial<T>): Promise<T>;
  remove(id: K): Promise<any>;
  /** Extra properties ride along in the request body too (e.g. a ticket number), same as `removeMany`'s `payload`. */
  updateMany(ids: K[], payload: Partial<T> & Record<string, unknown>): Promise<any>;
  /** `payload` rides along in the request body (e.g. a deletion reason or ticket number). */
  removeMany(ids: K[], payload?: Record<string, unknown>): Promise<any>;
}

export interface ServerResourceBinding<T = any, K = string | number> extends ResourceBinding<T, K> {
  total: number;
  page: number;
  setPage(page: number): void;
  pageSize: number;
  setPageSize(size: number): void;
  sortKey: string | null;
  sortDirection: "asc" | "desc";
  setSort(key: string, direction: "asc" | "desc"): void;
  filters: Record<string, string | string[]>;
  setFilters(filters: Record<string, string | string[]>): void;
}

/** Paging, sorting, search and filtering all done by the server. */
export declare function useServerResource<T = any, K = string | number>(
  service: ResourceService<T, K>,
  options?: { onToast?: (message: string) => void; pageSize?: number; search?: string }
): ServerResourceBinding<T, K>;

/**
 * @deprecated Use useServerResource. This fetches one large page and leaves
 * paging and sorting to the screen, so it drops rows once a table outgrows
 * pageSize.
 */
export declare function useResource<T = any, K = string | number>(
  service: ResourceService<T, K>,
  options?: { onToast?: (message: string) => void; pageSize?: number }
): ResourceBinding<T, K> & { setData: React.Dispatch<React.SetStateAction<T[]>> };

/** Fetches the values each column actually holds, for filter dropdowns. */
export declare function useDistinctValues(
  path: string,
  fields: string[],
  options?: { client?: ApiClient; allLabel?: string }
): { options: Record<string, { value: string; label: string }[]>; loading: boolean };

export interface PageFilterConfig {
  children?: React.ReactNode;
  onApply?: () => void;
  onClear?: () => void;
  /** Shown as a badge on the filter button. */
  activeCount?: number;
}

export declare const PageFilterProvider: React.FC<{ children?: React.ReactNode }>;
/** Publishes a page's filters into the shell. `config` must be memoised. */
export declare function usePageFilters(config: PageFilterConfig | null): void;
/** Reads whatever the current page published. For the shell. */
export declare function useHeaderFilters(): PageFilterConfig | null;

export interface ResourceFilterField {
  key: string;
  label: string;
  type?: "dropdown" | "dateRange" | "multiSelect";
  /** Overrides the values fetched from the server for this field. */
  options?: { value: string; label: string }[];
}

/**
 * Everything a screen needs to filter itself, from a list of field names.
 *
 * Publishes into the shell's filter panel rather than rendering one in the
 * page — a page-rendered panel is absolutely positioned inside a clipping
 * container and opens where nobody can see it. Options come from the server,
 * not from the rows on screen, which under paging are one page's worth.
 *
 * Handles the memoisation `usePageFilters` requires, so a plain array literal
 * of fields is safe to pass.
 */
export declare function useResourceFilters(params: {
  path: string;
  fields: ResourceFilterField[];
  /** A `multiSelect` field's value is an array; every other field's is a plain string. */
  filters: Record<string, string | string[]>;
  setFilters: (filters: Record<string, string | string[]>) => void;
  /**
   * Derive the options from these rows instead of asking the server. Correct
   * for a screen still holding all its data client-side, where the server's
   * full set would name values the loaded rows do not contain. Omit it once the
   * screen pages from the server.
   */
  rows?: any[];
  allLabel?: string;
  client?: ApiClient;
}): {
  /** The fields, as published to the shell's panel. */
  fields: React.ReactNode;
  /** The same fields plus Search/Clear, for `MobileTableWrapper`'s `filterOptions`. */
  mobileFilterOptions: React.ReactNode;
  activeCount: number;
  apply: () => void;
  clear: () => void;
};

export interface ResourceTableProps {
  title: string;
  /** Resource path, e.g. "/api/reports" */
  path: string;
  columns: DataTableColumn[];
  limit?: number;
  sortKey?: string;
  sortDirection?: "asc" | "desc";
  rowKey?: (row: any) => string | number;
  emptyMessage?: string;
  onOpenFull?: () => void;
  client?: ApiClient;
}

/** One dashboard panel: a title, a short slice of a resource, a link out. */
export declare const ResourceTable: React.FC<ResourceTableProps>;

export interface ChartWithDataProps {
  title: string;
  chart: React.ReactNode;
  columns: DataTableColumn[];
  /** The same data the chart was given. */
  rows: any[];
  rowKey?: (row: any) => string | number;
  emptyMessage?: string;
  /** Forwarded to the inner MobileTableWrapper. */
  dense?: boolean;
  /** Forwarded to the inner MobileTableWrapper. */
  headerAlign?: "auto" | "left" | "center" | "right";
}

/** A chart with the numbers it plots listed underneath it. */
export declare const ChartWithData: React.FC<ChartWithDataProps>;


// â”€â”€ Charts â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Wrappers around the charting library, so no page imports it directly and
// swapping it later is a change to these files rather than to every screen.

export interface ChartDatum {
  label: string;
  /** One value per entry in `series`, in the same order. */
  values: number[];
}

export interface BarChartProps {
  data?: ChartDatum[];
  /** Series names, in the same order as each datum's `values`. */
  series?: string[];
  /** Formats ticks, bar labels and tooltips. */
  formatValue?: (n: number) => string;
  /** Pixel height of the plot area. */
  height?: number;
  /** Print each bar's value above it. */
  showValues?: boolean;
  /** Lay the bars out left-to-right instead of bottom-up. */
  horizontal?: boolean;
  className?: string;
  emptyMessage?: string;
}

export declare const BarChart: React.FC<BarChartProps>;

export interface DonutChartDatum {
  label: string;
  value: number;
}

export interface DonutChartProps {
  data?: DonutChartDatum[];
  centerLabel?: React.ReactNode;
  centerValue?: React.ReactNode;
  formatValue?: (n: number) => string;
  height?: number;
  className?: string;
  emptyMessage?: string;
}

export declare const DonutChart: React.FC<DonutChartProps>;

/** Series colours, in the order they are handed out. Theme-aware. */
export declare const CHART_SERIES_COLOURS: string[];
/** Axis styling pulled from the active theme's tokens. */
export declare function chartAxisStyle(): Record<string, any>;

export interface ChartTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: React.ReactNode;
  formatValue?: (n: number) => string;
}

/** The themed tooltip the chart wrappers pass to the charting library. */
export declare const ChartTooltip: React.FC<ChartTooltipProps>;

// â”€â”€ Filtering â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface DataFilterFieldDef {
  key: string;
  label: string;
  /** Omit to derive the options from the rows themselves. */
  options?: { value: string; label: string }[];
}

export interface DataFilterProps {
  open?: boolean;
  onClose?: () => void;
  /** Rows to derive options from when a field declares none. */
  rows?: any[];
  fields?: DataFilterFieldDef[];
  values?: Record<string, string>;
  onChange?: (values: Record<string, string>) => void;
  title?: string;
  onSearch?: () => void;
  onClear?: () => void;
  className?: string;
}

/** Data-driven filter popover. */
export declare const DataFilter: React.FC<DataFilterProps>;

/** Applies a filter map to rows. Values equal to the "all" sentinel are ignored. */
export declare function applyDataFilter<T = any>(rows: T[], values?: Record<string, string>): T[];
/** How many filters are actually set â€” for the badge on a filter button. */
export declare function countActiveFilters(values?: Record<string, string>): number;

export interface FilterFieldProps {
  label?: React.ReactNode;
  htmlFor?: string;
  className?: string;
  children?: React.ReactNode;
}

/** One labelled control inside a filter panel. */
export declare const FilterField: React.FC<FilterFieldProps>;

export interface FilterToggleProps {
  label?: React.ReactNode;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  className?: string;
}

export declare const FilterToggle: React.FC<FilterToggleProps>;

// â”€â”€ Misc â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface ContextMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick?: (payload: any) => void;
  danger?: boolean;
}

export interface ContextMenuProps {
  open?: boolean;
  /** Viewport coordinates, normally from the triggering event. */
  x?: number;
  y?: number;
  items?: ContextMenuItem[];
  /** Passed to each item's onClick â€” usually the row that was right-clicked. */
  payload?: any;
  onClose?: () => void;
  minWidth?: number;
  className?: string;
}

export declare const ContextMenu: React.FC<ContextMenuProps>;

export interface ErrorBoundaryProps {
  children?: React.ReactNode;
  title?: string;
  description?: string;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  /** Replaces the default fallback entirely. */
  fallback?: React.ReactNode;
}

/** Keeps a render error in one subtree from blanking the whole app. */
export declare class ErrorBoundary extends React.Component<ErrorBoundaryProps> {}

export interface ExternalDeviceInfoModalProps {
  open?: boolean;
  onClose?: () => void;
  license?: any;
  onToast?: (message: string) => void;
}

export declare const ExternalDeviceInfoModal: React.FC<ExternalDeviceInfoModalProps>;

// ── Sign-in ──────────────────────────────────────────────────────────────────

export interface AuthBrandingProps {
  /**
   * Replaces the stock mark, in both the desktop brand panel and the compact
   * mark above the card. Draw the wordmark in `currentColor`: the panel sits on
   * the chrome colour and the card on the canvas, and the container sets each.
   */
  logo?: React.ReactNode;
  /** Used when no `logo` is given. Defaults to "my Design System". */
  brandName?: string;
}

export interface AuthLayoutProps extends AuthBrandingProps {
  children?: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  features?: Array<{ icon?: React.ReactNode; label: string }>;
  /** Hide the decorative desktop panel, leaving just the card. */
  showBrandPanel?: boolean;
  topRight?: React.ReactNode;
  footer?: React.ReactNode;
}

/** Split-screen shell for sign-in screens. Presentational only. */
export declare const AuthLayout: React.FC<AuthLayoutProps>;

export interface LoginFormProps extends AuthBrandingProps {
  /** Called with the identifier once `validate` resolves. */
  onContinue?: (identifier: string) => void;
  /** Throw to reject the identifier; the message is shown under the field. */
  validate?: (identifier: string) => Promise<void>;
  label?: string;
  placeholder?: string;
  autoComplete?: string;
  heading?: string;
  subheading?: string;
  /** Pass null to hide the demo hint. */
  hint?: React.ReactNode;
  /** Pass null to hide the footer. */
  footer?: React.ReactNode;
  /** Forwarded to AuthLayout, e.g. a ThemeSwitcher. */
  topRight?: React.ReactNode;
}

/** The identifier step of sign-in. Renders its own AuthLayout. */
export declare const LoginForm: React.FC<LoginFormProps>;

export interface LoginPasswordFormProps extends AuthBrandingProps {
  /** The identifier collected by LoginForm, shown above the field. */
  email?: string;
  onBack?: () => void;
  onSignIn?: (password: string) => Promise<void> | void;
  hint?: React.ReactNode;
  footer?: React.ReactNode;
  /** Forwarded to AuthLayout, e.g. a ThemeSwitcher. */
  topRight?: React.ReactNode;
}

/** The password step of sign-in. Renders its own AuthLayout. */
export declare const LoginPasswordForm: React.FC<LoginPasswordFormProps>;
