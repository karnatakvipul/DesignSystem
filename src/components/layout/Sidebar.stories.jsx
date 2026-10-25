import * as React from "react";
import { KeyRound, FileText, FileCode, Clock, BarChart3, UserCheck, User } from "lucide-react";
import { Sidebar } from "./Sidebar";

const ITEMS = [
  { key: "license", label: "License", icon: <KeyRound size={18} />, active: true },
  { key: "licenseType", label: "License Type", icon: <FileText size={18} /> },
  { key: "productType", label: "Product Type", icon: <FileCode size={18} /> },
  { key: "licenseTerm", label: "License Term", icon: <Clock size={18} /> },
  { key: "report", label: "Report", icon: <BarChart3 size={18} /> },
  { key: "userActivity", label: "User Activity", icon: <UserCheck size={18} /> },
  { key: "users", label: "Users", icon: <User size={18} /> },
];

/**
 * The navigation rail.
 *
 * On desktop it runs in **peek mode**: collapsed to 60px, expanding to 240px
 * on hover, and pinning open when you click an item or the footer control.
 * Below `md` it is a drawer instead, driven by `mobileOpen`/`onMobileClose`.
 *
 * `collapsed` and `onCollapsedChange` make the pinned state controlled; leave
 * them off and the rail manages it internally.
 *
 * **On the logo.** The collapsed/expanded swap is a React state change and
 * lands instantly, but the rail's width is a 200ms transition — so for those
 * frames the logo is wider than the box holding it. The logo bar anchors its
 * content left rather than centring it, so the mark stays put and only the
 * wordmark is revealed or clipped. Centred, the overflow split across both
 * sides and carried the mark off the left edge, making it blink out on every
 * hover.
 */
const meta = {
  title: "Layout/Sidebar",
  component: Sidebar,
  tags: ["autodocs"],
  argTypes: {
    items: {
      control: "object",
      description: "`{ key, label, icon?, active?, onClick? }[]`.",
    },
    collapsed: { control: "boolean", description: "Controlled pinned state. Omit to let the rail manage it." },
    onCollapsedChange: { action: "collapsed changed" },
    logo: { control: false, description: "Cloned with `{ collapsed, isExpanded }`, or called with them if a function." },
    mobileOpen: { control: "boolean", description: "Drawer open state below `md`." },
    onMobileClose: { action: "mobile closed" },
    showPin: {
      control: "boolean",
      description: "Hides the pin glyph beside the collapse chevron. The control still pins either way.",
    },
    className: { control: "text" },
  },
  args: { items: ITEMS, showPin: true },
  render: (args) => (
    <div className="flex h-[32rem] overflow-hidden rounded-surface border border-card-border">
      <Sidebar {...args} />
      <div className="flex-1 bg-canvas p-4 text-body-sm text-ink-muted">
        Hover the rail to peek it open.
      </div>
    </div>
  ),
};

export default meta;

/** Hover the rail — it expands to 240px and the wordmark appears beside the mark. */
export const Playground = {};

/** Pinned open. */
export const Expanded = {
  args: { collapsed: false },
};

/** Collapsed to icons. Hovering still peeks it open. */
export const Collapsed = {
  args: { collapsed: true },
};

/** `showPin={false}` leaves just the collapse chevron, for an app whose rail is effectively always pinned. */
export const WithoutPinGlyph = {
  args: { collapsed: false, showPin: false },
};

/** Below `md` the rail becomes a drawer over the content. */
export const MobileDrawer = {
  parameters: { viewport: { defaultViewport: "mobile1" } },
  render: function Render(args) {
    const [open, setOpen] = React.useState(true);
    return (
      <div className="relative h-[32rem] overflow-hidden rounded-surface border border-card-border bg-canvas">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="m-4 rounded-control border border-card-border px-3 py-1 text-body-sm text-ink-primary"
        >
          Open drawer
        </button>
        <Sidebar {...args} mobileOpen={open} onMobileClose={() => setOpen(false)} />
      </div>
    );
  },
};

/** A custom logo is cloned with `{ collapsed, isExpanded }`, so it can render its own collapsed form. */
export const CustomLogo = {
  args: {
    collapsed: false,
    logo: function BrandLogo({ collapsed }) {
      return (
        <span className="flex items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-control bg-accent text-white">
            A
          </span>
          {!collapsed && <span className="font-secondary text-base font-extrabold">Acme Corp</span>}
        </span>
      );
    },
  },
};

/** Clicking an item reports it and pins the rail open. */
export const Interactive = {
  render: function Render(args) {
    const [activeKey, setActiveKey] = React.useState("license");
    return (
      <div className="flex h-[32rem] overflow-hidden rounded-surface border border-card-border">
        <Sidebar
          {...args}
          items={ITEMS.map((i) => ({
            ...i,
            active: i.key === activeKey,
            onClick: () => setActiveKey(i.key),
          }))}
        />
        <div className="flex-1 bg-canvas p-4 text-body-sm text-ink-primary">
          Active section: <span className="font-mono">{activeKey}</span>
        </div>
      </div>
    );
  },
};
