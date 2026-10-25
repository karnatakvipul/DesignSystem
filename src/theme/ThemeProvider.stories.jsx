import { ThemeProvider, useTheme, THEMES, DEFAULT_THEME } from "./index";
import { Card } from "../components/common/Card";
import { Badge } from "../components/common/Badge";
import { Button } from "../components/common/Button";

/**
 * Supplies the active theme to everything beneath it, by writing the
 * library's colour tokens as CSS custom properties.
 *
 * Every component reads those tokens rather than hard-coded colours, which is
 * why switching the theme re-colours the whole tree with no component
 * re-rendering logic of its own.
 *
 * **`global` is the prop that matters.** Left `true` (the default) the tokens
 * are written to `:root`, theming the entire document — what an app wants, and
 * it also persists the choice to `localStorage` under `storageKey`. Set to
 * `false` the tokens are scoped to the provider's own subtree, which is how
 * Storybook previews a theme without repainting the whole manager UI, and how
 * you would preview one region in a different theme.
 *
 * Pass `theme` to control it, or `defaultTheme` to seed an uncontrolled one
 * that the user (or a `ThemeSwitcher`) can then change.
 *
 * These stories nest a second provider inside Storybook's own — use the
 * toolbar theme picker to see the outer one change while the scoped blocks
 * below stay pinned.
 */
const meta = {
  title: "Theme/ThemeProvider",
  component: ThemeProvider,
  tags: ["autodocs"],
  argTypes: {
    theme: {
      control: "select",
      options: Object.keys(THEMES),
      description: "Controlled theme key. Omit to let the provider manage it.",
    },
    defaultTheme: {
      control: "select",
      options: Object.keys(THEMES),
      description: "Initial theme for the uncontrolled case.",
    },
    storageKey: {
      control: "text",
      description: 'Where the choice is persisted. Defaults to `"sls_theme"`. Only used when `global` is true.',
    },
    onThemeChange: { action: "theme changed" },
    global: {
      control: "boolean",
      description: "`true` writes tokens to `:root` (whole document). `false` scopes them to this subtree.",
    },
    children: { control: false },
  },
  args: { global: false, theme: DEFAULT_THEME },
};

export default meta;

function Swatch() {
  const { theme } = useTheme();
  return (
    <Card className="p-4">
      <p className="mb-3 font-secondary text-body font-semibold text-ink-primary">
        Active theme: <span className="font-mono">{theme}</span>
      </p>
      <div className="mb-3 flex flex-wrap gap-2">
        <Badge tone="online">Active</Badge>
        <Badge tone="warn">Expiring</Badge>
        <Badge tone="offline">Expired</Badge>
        <Badge tone="accent">New</Badge>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="primary" size="sm">
          Primary
        </Button>
        <Button variant="secondary" size="sm">
          Secondary
        </Button>
      </div>
    </Card>
  );
}

export const Playground = {
  render: (args) => (
    <ThemeProvider {...args}>
      <Swatch />
    </ThemeProvider>
  ),
};

/**
 * All four shipped themes side by side, each in its own scoped provider —
 * only possible because `global={false}` keeps the tokens inside the subtree.
 */
export const AllThemes = {
  render: () => (
    <div className="grid gap-4 sm:grid-cols-2">
      {Object.keys(THEMES).map((key) => (
        <ThemeProvider key={key} theme={key} global={false}>
          <Swatch />
        </ThemeProvider>
      ))}
    </div>
  ),
};

/**
 * A scoped provider inside the page's own theme. Change the toolbar theme and
 * the outer text follows while the boxed region stays pinned to its own.
 */
export const ScopedToASubtree = {
  render: () => (
    <div className="flex flex-col gap-3">
      <p className="text-body-sm text-ink-muted">
        This line uses the page theme — change it from the toolbar.
      </p>
      <div className="rounded-surface border border-dashed border-card-border p-3">
        <p className="mb-2 text-body-sm text-ink-muted">Scoped to `carbon-pro`, whatever the page is:</p>
        <ThemeProvider theme="carbon-pro" global={false}>
          <Swatch />
        </ThemeProvider>
      </div>
    </div>
  ),
};

/** Uncontrolled: `defaultTheme` seeds it, and it manages the value from there. */
export const Uncontrolled = {
  render: () => (
    <ThemeProvider defaultTheme="narnix-edge" global={false}>
      <Swatch />
    </ThemeProvider>
  ),
};
