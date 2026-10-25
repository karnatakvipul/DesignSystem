/**
 * Dev-only preview harness — NOT part of the published library.
 * Wires every page/feature component from the SLS spec into one
 * interactive app with real HashRouter navigation, auth state, and theme management.
 */
import * as React from "react";
import {
  HashRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  BadgeCheck, FileText, FileCode, Clock, BarChart3, CalendarClock, Map,
  Briefcase, UserCheck, User,
} from "lucide-react";
import {
  ThemeProvider,
  ThemeSwitcher,
  MainLayout,
  Header,
  Sidebar,
  ProfileMenu,
  Footer,
  SearchBox,
  LicenseAgentButton,
  LoginForm,
  LoginPasswordForm,
  LicensePage,
  UsersPage,
  LicenseTypePage,
  LicenseTermPage,
  ProductTypePage,
  ReportPage,
  SlsReportDashboard,
  HomeDashboard,
  UserProfilePage,
  ErrorBoundary,
} from "./index.js";

const NAV_ITEMS = [
  { key: "licenses", path: "/licenses", label: "Licenses", icon: <BadgeCheck size={18} /> },
  { key: "licenseType", path: "/license-type", label: "License Type", icon: <FileText size={18} /> },
  { key: "productType", path: "/product-type", label: "Product Type", icon: <FileCode size={18} /> },
  { key: "licenseTerm", path: "/license-term", label: "License Term", icon: <Clock size={18} /> },
  { key: "report", path: "/report", label: "Report", icon: <BarChart3 size={18} /> },
  { key: "reminders", path: "/reminders", label: "Reminders", icon: <CalendarClock size={18} /> },
  { key: "statusMap", path: "/status-map", label: "Status Map", icon: <Map size={18} /> },
  { key: "reminderConfig", path: "/reminder-config", label: "Reminder Config", icon: <Briefcase size={18} /> },
  { key: "userActivity", path: "/user-activity", label: "User Activity", icon: <UserCheck size={18} /> },
  { key: "users", path: "/users", label: "Users", icon: <User size={18} /> },
];

const PAGE_TITLES = {
  "/licenses": "Licenses",
  "/license-type": "License Type",
  "/product-type": "Product Type",
  "/license-term": "License Term",
  "/report": "Report",
  "/reminders": "Reminders",
  "/status-map": "Status Map",
  "/reminder-config": "Reminder Config",
  "/user-activity": "User Activity",
  "/users": "Users",
};

function Toast({ toasts }) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-6 left-1/2 z-100 flex -translate-x-1/2 flex-col gap-2">
      {toasts.map((t) => (
        <div key={t.id} className="rounded-md bg-accent px-4 py-2 text-body text-white shadow-lg">
          {t.message}
        </div>
      ))}
    </div>
  );
}

function MainAppShell({ onSignOut, showToast }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const currentTitle = PAGE_TITLES[location.pathname] || "Licenses";

  return (
    <MainLayout
      sidebar={
        <Sidebar
          logo={<span className="font-secondary text-body font-bold text-ink-onchrome tracking-wide">my Design System</span>}
          collapsed={collapsed}
          onCollapsedChange={setCollapsed}
          mobileOpen={mobileNavOpen}
          onMobileClose={() => setMobileNavOpen(false)}
          items={NAV_ITEMS.map((item) => ({
            ...item,
            active: location.pathname === item.path || (location.pathname === "/" && item.path === "/licenses"),
            onClick: () => {
              navigate(item.path);
              setMobileNavOpen(false);
            },
          }))}
        />
      }
      header={
        <Header
          title={currentTitle}
          search={<SearchBox placeholder="Search Data" value={search} onChange={(e) => setSearch(e.target.value)} />}
          actions={
            <div className="flex items-center gap-3">
              <ThemeSwitcher />
              <LicenseAgentButton />
            </div>
          }
          profileMenu={<ProfileMenu onSignOut={onSignOut} />}
          onOpenMobileSidebar={() => setMobileNavOpen(true)}
        />
      }
      footer={<Footer text="© 2026 my Design System — Software License System" />}
    >
      <ErrorBoundary title="Page Error" description="An unexpected error occurred on this page. Click below to refresh the page view.">
        <Routes>
          <Route path="/" element={<Navigate to="/licenses" replace />} />
          <Route path="/licenses" element={<LicensePage onToast={showToast} />} />
          <Route path="/license-type" element={<LicenseTypePage onToast={showToast} />} />
          <Route path="/product-type" element={<ProductTypePage onToast={showToast} />} />
          <Route path="/license-term" element={<LicenseTermPage onToast={showToast} />} />
          <Route path="/report" element={<ReportPage onToast={showToast} />} />
          <Route path="/reminders" element={<SlsReportDashboard onToast={showToast} />} />
          <Route path="/status-map" element={<HomeDashboard />} />
          <Route path="/reminder-config" element={<ReportPage onToast={showToast} />} />
          <Route path="/user-activity" element={<UserProfilePage onToast={showToast} />} />
          <Route path="/users" element={<UsersPage onToast={showToast} />} />
          <Route path="*" element={<Navigate to="/licenses" replace />} />
        </Routes>
      </ErrorBoundary>
    </MainLayout>
  );
}

export default function App() {
  const [authStep, setAuthStepRaw] = React.useState(() => {
    try { return localStorage.getItem("m2m_auth_step") || "email"; } catch { return "email"; }
  });
  const [email, setEmailRaw] = React.useState(() => {
    try { return localStorage.getItem("m2m_auth_email") || ""; } catch { return ""; }
  });
  const [toasts, setToasts] = React.useState([]);

  function setAuthStep(step) {
    setAuthStepRaw(step);
    try { localStorage.setItem("m2m_auth_step", step); } catch { /* ignore storage error */ }
  }
  function setEmail(e) {
    setEmailRaw(e);
    try { localStorage.setItem("m2m_auth_email", e); } catch { /* ignore storage error */ }
  }

  function showToast(message) {
    const id = Date.now();
    setToasts((t) => [...t, { id, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2500);
  }

  function handleSignOut() {
    try {
      localStorage.removeItem("m2m_auth_step");
      localStorage.removeItem("m2m_auth_email");
    } catch { /* ignore storage error */ }
    setAuthStep("email");
  }

  if (authStep === "email") {
    return (
      <ThemeProvider>
        <LoginForm onContinue={(e) => { setEmail(e); setAuthStep("password"); }} />
      </ThemeProvider>
    );
  }

  if (authStep === "password") {
    return (
      <ThemeProvider>
        <LoginPasswordForm email={email} onBack={() => setAuthStep("email")} onSignIn={() => setAuthStep("in")} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <HashRouter>
        <MainAppShell onSignOut={handleSignOut} showToast={showToast} />
        <Toast toasts={toasts} />
      </HashRouter>
    </ThemeProvider>
  );
}