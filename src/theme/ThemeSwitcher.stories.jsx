import { ThemeSwitcher } from "./ThemeSwitcher";
import { Button } from "../components/common/Button";
import { Badge } from "../components/common/Badge";
import { Card } from "../components/common/Card";
import { InputField } from "../components/common/InputField";

/**
 * The theme picker that sits in the header.
 *
 * It reads and writes the theme through `useTheme`, so it must be rendered
 * inside a `ThemeProvider` — the library's Storybook decorator provides one,
 * which is why these stories work standalone.
 *
 * Icon-only by default, since in a header it sits in a row of icon buttons.
 * `showLabel` adds the theme's name beside it, for a settings screen where the
 * control is on its own and an unlabelled icon would be a guess.
 *
 * The menu closes on outside click and Escape.
 */
const meta = {
  title: "Theme/ThemeSwitcher",
  component: ThemeSwitcher,
  tags: ["autodocs"],
  argTypes: {
    showLabel: {
      control: "boolean",
      description: "Show the current theme's name beside the icon. Off by default.",
    },
    className: { control: "text" },
  },
  args: { showLabel: false },
};

export default meta;

/** Open it and switch themes — everything on the page follows. */
export const Playground = {};

/** With the name beside the icon, for a settings screen. */
export const WithLabel = { args: { showLabel: true } };

/** Switching the theme re-colours every component, because they all read the same tokens. */
export const AffectsTheWholePalette = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <ThemeSwitcher showLabel />
        <span className="text-body-sm text-ink-muted">← switch, and watch everything below</span>
      </div>
      <Card className="p-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            <Badge tone="online">Active</Badge>
            <Badge tone="warn">Expiring soon</Badge>
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
            <Button variant="danger" size="sm">
              Danger
            </Button>
          </div>
          <div className="w-64">
            <InputField label="Account" placeholder="Aaxis Nano" />
          </div>
        </div>
      </Card>
    </div>
  ),
};
