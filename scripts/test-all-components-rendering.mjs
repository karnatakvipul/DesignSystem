import React from "react";
import ReactDOMServer from "react-dom/server";
import { resolve, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const bundleEntry = resolve(root, "dist/index.es.js");

console.log("🚀 Starting Comprehensive Library Component Test Harness...");

const publicApi = await import(pathToFileURL(bundleEntry).href);

let totalTested = 0;
let passed = 0;
let failed = 0;
const errors = [];

const defaultProps = {
  DataTable: publicApi.demoDataTableProps || {},
  MobileTableWrapper: { columns: publicApi.demoColumns, data: publicApi.demoData, rowKey: (r) => r.id },
  MobileCardList: { columns: publicApi.demoColumns, data: publicApi.demoData, rowKey: (r) => r.id },
  Pagination: publicApi.demoPaginationProps || { page: 1, pageSize: 10, total: 50 },
  Dropdown: publicApi.demoDropdownProps || { options: [{ value: "1", label: "One" }] },
  Sidebar: publicApi.demoSidebarProps || { items: [] },
  Header: { title: "Test Header" },
  MainLayout: { children: React.createElement("div", null, "Content") },
  Panel: { title: "Test Panel", children: React.createElement("div", null, "Body") },
  Modal: { open: false, children: React.createElement("div", null, "Modal Content") },
  ConfirmDialog: { open: false, title: "Confirm" },
  FormModal: { open: false, title: "Form" },
  SlideOverModal: { open: false, title: "Drawer" },
  BottomSheet: { open: false, title: "Sheet" },
  Badge: { children: "Active" },
  Button: { children: "Click Me" },
  IconButton: { icon: React.createElement("span", null, "X"), label: "Test" },
  FloatingAddButton: { label: "Add" },
  InputField: { label: "Input" },
  PasswordInput: { label: "Password" },
  SearchBox: { value: "", onChange: () => {} },
  PasswordStrengthMeter: { password: "TestPassword123" },
  ValidationMessage: { message: "Error" },
  FormGroup: { label: "Group", children: React.createElement("input") },
  MultiSelectDropdown: { options: [{ value: "1", label: "A" }], value: [] },
  ColumnFilterDropdown: { columns: [{ key: "a", label: "A" }], visible: ["a"] },
  ToggleButtonGroup: { options: [{ value: "1", label: "A" }], value: "1" },
  Checkbox: { label: "Check" },
  RowSelectCheckbox: { checked: false },
  DatePicker: { label: "Date" },
  DateRangePicker: { label: "Range" },
  TableToolbar: { start: React.createElement("span", null, "Start") },
  Card: { children: "Card" },
  Loader: { label: "Loading" },
  Tabs: { items: [{ value: "1", label: "T1" }], value: "1" },
  FilterPanel: { open: false },
  DynamicRowList: { items: [] },
  Footer: {},
  ProfileMenu: { name: "User", role: "Admin" },
  AuthLayout: { title: "Auth", children: React.createElement("div") },
  LicenseAgentButton: {},
  InvoicePreviewModal: { open: false },
  ChangesPreviewModal: { open: false },
  ReportWidget: { title: "Report" },
  UpcomingRenewalChart: { data: [] },
  LicenseTrendChart: { data: [] },
  LicenseToolbar: {},
  LicenseFormModal: { open: false },
  DeleteLicenseModal: { open: false },
  ActivateLicenseModal: { open: false },
  DeactivateLicenseModal: { open: false },
  UpdatePropertyModal: { open: false },
  LicenseFilter: { open: false },
  TimelineModal: { open: false },
  HistoryPiInvoiceModal: { open: false },
  SingleLicensePreviewModal: { open: false },
  LicenseRenewalModal: { open: false },
  ManageRenewalStreamModal: { open: false },
  ValidateTicketModal: { open: false },
  CancelPiModal: { open: false },
  SelectionRowPreviewModal: { open: false },
  UserFormModal: { open: false },
  UsersFilter: { open: false },
  LicenseTypeFormModal: { open: false },
  LicenseTermFormModal: { open: false },
  ProductTypeFormModal: { open: false },
  ReportFilter: { open: false },
  InvoicePdfViewer: {},
  ExcelPreviewViewer: {},
  ChangePasswordModal: { open: false },
  PermissionEditor: {},
  ProfileActions: {},
  Toast: { toast: { id: "1", message: "Test", tone: "info" } },
  ToastItem: { toast: { id: "1", message: "Test", tone: "info" } },
  LicensePage: {},
  UsersPage: {},
  LicenseTypePage: {},
  LicenseTermPage: {},
  ProductTypePage: {},
  ReportPage: {},
  SlsReportDashboard: {},
  HomeDashboard: {},
  UserProfilePage: {},
  LoginForm: {},
  LoginPasswordForm: {},
  MasterListPage: {}
};

const nonComponentExports = new Set([
  "cn", "themes", "useTheme", "useToast", "demoColumns", "demoData", "demoDataTableProps",
  "demoDropdownProps", "demoPaginationProps", "demoSidebarProps",
  "makeInitialLicenseTerms", "makeInitialLicenseTypes", "makeInitialLicenses",
  "makeInitialProductTypes", "makeInitialReports", "makeInitialTimeline",
  "makeInitialUsers", "makeLicenseTrendData", "makeMaterialsData", "makeUpcomingRenewalData"
]);

for (const [exportName, Component] of Object.entries(publicApi)) {
  if (nonComponentExports.has(exportName)) continue;
  if (typeof Component !== "function" && typeof Component !== "object") continue;

  const isComponent =
    typeof Component === "function" ||
    (typeof Component === "object" && Component !== null && Component.$$typeof);

  if (isComponent) {
    totalTested++;
    try {
      const props = defaultProps[exportName] || {};
      const element = React.createElement(
        publicApi.ThemeProvider || "div",
        null,
        React.createElement(Component, props)
      );

      const html = ReactDOMServer.renderToString(element);
      if (typeof html === "string") {
        passed++;
        console.log(`  ✓ <${exportName} /> rendered successfully.`);
      } else {
        throw new Error("Rendered HTML was invalid string");
      }
    } catch (err) {
      failed++;
      errors.push({ exportName, error: err.message });
      console.error(`❌ Failed rendering component <${exportName} />:`, err.message);
    }
  }
}

console.log(`\n==================================================`);
console.log(`✅ TEST COMPLETE: Tested ${totalTested} UI Components.`);
console.log(`PASSED: ${passed}/${totalTested}`);
if (failed > 0) {
  console.log(`FAILED: ${failed}/${totalTested}`);
  process.exit(1);
} else {
  console.log(`🎉 100% of all public library UI components rendered cleanly with ZERO errors!`);
}
