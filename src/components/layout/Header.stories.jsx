import { Header } from "./Header";
import { SearchBox } from "../common/SearchBox";
import { ThemeSwitcher } from "../../theme";
import { ProfileMenu } from "./ProfileMenu";

/**
 * The top bar: page title on the left, optional search, then actions and the
 * profile menu.
 *
 * It is 48px tall on a phone rather than 40px, because the controls inside are
 * `control-lg` touch targets (44px) — at 40px they overhung the bar. The bar
 * grows to fit them rather than the targets shrinking below the 44px minimum.
 *
 * `onOpenMobileSidebar` adds the hamburger below `md`, which is the only way
 * to reach the navigation once the rail becomes a drawer — pass it whenever
 * there is a `Sidebar`.
 *
 * Its height must stay in step with `Sidebar`'s logo bar: the two sit side by
 * side and their bottom borders read as one rule across the page, until the
 * heights differ and a visible step appears.
 */
const meta = {
  title: "Layout/Header",
  component: Header,
  tags: ["autodocs"],
  argTypes: {
    title: { control: "text", description: "Current page name." },
    logo: { control: false, description: "Usually mobile-only — a closed drawer takes the mark off screen entirely." },
    search: { control: false, description: "A `SearchBox`, or anything else." },
    searchAlign: {
      control: "inline-radio",
      options: ["center", "end"],
      description: "Where the search sits along the bar.",
    },
    actions: { control: false, description: "Nodes before the profile menu — theme switcher, notifications." },
    profileMenu: { control: false },
    onOpenMobileSidebar: {
      action: "open mobile sidebar",
      description: "Renders the hamburger below `md`. Pass it whenever a `Sidebar` exists.",
    },
    className: { control: "text" },
  },
  args: { title: "License", searchAlign: "center" },
  render: (args) => (
    <div className="overflow-hidden rounded-surface border border-card-border">
      <Header
        {...args}
        search={<SearchBox placeholder="Search Data" enableShortcut showShortcutKey />}
        actions={<ThemeSwitcher />}
        profileMenu={<ProfileMenu user={{ name: "Super Admin", email: "admin@my Design System.com", role: "Super Administrator" }} />}
      />
      <div className="bg-canvas p-6 text-body-sm text-ink-muted">Page content sits below the bar.</div>
    </div>
  ),
};

export default meta;

export const Playground = {};

/** Centred search reads as a global command bar; `end` keeps it with the other controls. */
export const SearchAlignment = {
  render: () => (
    <div className="flex flex-col gap-6">
      {["center", "end"].map((align) => (
        <div key={align}>
          <p className="mb-2 text-body-sm text-ink-muted">searchAlign=&quot;{align}&quot;</p>
          <div className="overflow-hidden rounded-surface border border-card-border">
            <Header
              title="License"
              searchAlign={align}
              search={<SearchBox placeholder="Search Data" />}
              actions={<ThemeSwitcher />}
              profileMenu={<ProfileMenu user={{ name: "Super Admin", email: "admin@my Design System.com" }} />}
            />
          </div>
        </div>
      ))}
    </div>
  ),
};

/** Title and profile only — for a screen with nothing to search. */
export const TitleOnly = {
  render: () => (
    <div className="overflow-hidden rounded-surface border border-card-border">
      <Header title="SLS Account" profileMenu={<ProfileMenu user={{ name: "Super Admin", email: "admin@my Design System.com" }} />} />
    </div>
  ),
};

/** Below `md`: the hamburger appears and the bar grows to 48px for its touch targets. */
export const Mobile = {
  parameters: { viewport: { defaultViewport: "mobile1" } },
  render: (args) => (
    <div className="overflow-hidden rounded-surface border border-card-border">
      <Header
        {...args}
        onOpenMobileSidebar={() => {}}
        logo={
          <div className="md:hidden flex h-8 w-8 items-center justify-center rounded-control bg-accent text-white">
            M
          </div>
        }
        search={<SearchBox placeholder="Search Data" />}
        actions={<ThemeSwitcher />}
        profileMenu={<ProfileMenu user={{ name: "Super Admin", email: "admin@my Design System.com" }} />}
      />
    </div>
  ),
};
