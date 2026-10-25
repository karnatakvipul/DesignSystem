import * as React from "react";
import { KeyRound, FileText, BarChart3, User } from "lucide-react";
import { MainLayout } from "./MainLayout";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { SearchBox } from "../common/SearchBox";
import { ProfileMenu } from "./ProfileMenu";
import { ThemeSwitcher } from "../../theme";

const ITEMS = [
  { key: "license", label: "License", icon: <KeyRound size={18} />, active: true },
  { key: "licenseType", label: "License Type", icon: <FileText size={18} /> },
  { key: "report", label: "Report", icon: <BarChart3 size={18} /> },
  { key: "users", label: "Users", icon: <User size={18} /> },
];

/**
 * The app shell: sidebar down the left, header across the top, your page in
 * the middle, optional footer beneath.
 *
 * It is pure structure — four slots and the scroll containment. It fixes the
 * whole thing to `100dvh` and keeps `overflow: hidden` at the top level, so
 * scrolling happens *inside* the page rather than the window. That is what
 * keeps the sidebar and header fixed while a long table scrolls beneath them.
 *
 * Because the shell owns the height, a page inside it should be a flex column
 * with `min-h-0` and do its own scrolling — a page that grows past the shell
 * will be clipped rather than extending the window.
 */
const meta = {
  title: "Layout/MainLayout",
  component: MainLayout,
  tags: ["autodocs"],
  argTypes: {
    sidebar: { control: false, description: "Usually a `Sidebar`." },
    header: { control: false, description: "Usually a `Header`." },
    footer: { control: false, description: "Optional `Footer`." },
    children: { control: false, description: "The page." },
    className: { control: "text" },
  },
  parameters: { layout: "fullscreen" },
};

export default meta;

function Page({ rows = 6 }) {
  return (
    <div className="flex h-full min-h-0 flex-col gap-2 rounded bg-chrome p-2">
      <p className="text-body-sm text-ink-muted">
        A page scrolls inside the shell — the sidebar and header stay put.
      </p>
      <div className="min-h-0 flex-1 overflow-auto rounded-surface border border-card-border bg-card">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="border-b border-card-border px-4 py-3 text-body-sm text-ink-primary last:border-0">
            Licence record {i + 1}
          </div>
        ))}
      </div>
    </div>
  );
}

export const Playground = {
  render: (args) => (
    <div className="h-[36rem]">
      <MainLayout
        {...args}
        sidebar={<Sidebar items={ITEMS} />}
        header={
          <Header
            title="License"
            searchAlign="center"
            search={<SearchBox placeholder="Search Data" />}
            actions={<ThemeSwitcher />}
            profileMenu={<ProfileMenu user={{ name: "Super Admin", email: "admin@my Design System.com" }} />}
            onOpenMobileSidebar={() => {}}
          />
        }
      >
        <Page />
      </MainLayout>
    </div>
  ),
};

/** With the optional footer slot filled. */
export const WithFooter = {
  render: () => (
    <div className="h-[36rem]">
      <MainLayout
        sidebar={<Sidebar items={ITEMS} />}
        header={<Header title="License" profileMenu={<ProfileMenu user={{ name: "Super Admin", email: "admin@my Design System.com" }} />} />}
        footer={<Footer />}
      >
        <Page rows={4} />
      </MainLayout>
    </div>
  ),
};

/** Long content scrolls inside the page, not the window — the chrome never moves. */
export const ScrollingContent = {
  render: () => (
    <div className="h-[36rem]">
      <MainLayout
        sidebar={<Sidebar items={ITEMS} />}
        header={<Header title="License" profileMenu={<ProfileMenu user={{ name: "Super Admin", email: "admin@my Design System.com" }} />} />}
      >
        <Page rows={60} />
      </MainLayout>
    </div>
  ),
};

/** Below `md` the rail becomes a drawer, reached from the header's hamburger. */
export const Mobile = {
  parameters: { viewport: { defaultViewport: "mobile1" } },
  render: function Render() {
    const [navOpen, setNavOpen] = React.useState(false);
    return (
      <div className="h-[36rem]">
        <MainLayout
          sidebar={<Sidebar items={ITEMS} mobileOpen={navOpen} onMobileClose={() => setNavOpen(false)} />}
          header={
            <Header
              title="License"
              onOpenMobileSidebar={() => setNavOpen(true)}
              search={<SearchBox placeholder="Search Data" />}
              profileMenu={<ProfileMenu user={{ name: "Super Admin", email: "admin@my Design System.com" }} />}
            />
          }
        >
          <Page rows={20} />
        </MainLayout>
      </div>
    );
  },
};
