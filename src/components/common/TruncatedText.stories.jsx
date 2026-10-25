import { TruncatedText, EllipsisText, Ellipsis } from "./TruncatedText";

const LONG = "my Design System - Imtb Engineers Pvt Ltd — Gmr Airport Hyderabad: Aemb Domestic Tank Terminal";

/**
 * One-line text that clips with an ellipsis and reveals the whole value on
 * hover.
 *
 * Two ways to shorten, and they are not interchangeable:
 *
 * - **CSS clipping** (default) fits the text to whatever width the cell
 *   happens to be. Right for a table column, whose width is set by the layout.
 * - **`maxLength`** cuts at a fixed number of characters, regardless of the
 *   space available. Right when the value must be capped on principle, not by
 *   fit.
 *
 * The tooltip always shows on hover rather than only when the text overflows:
 * inside `DataTable`'s fixed-layout cells the overflow measurement can come
 * back false even when the text is visibly clipped, which silently suppressed
 * it.
 *
 * **Inside a card, override it.** The clipping is right for a fixed-width
 * table cell and wrong for a card that has room to wrap — see `MobileCardList`,
 * which resets descendant `.truncate` back to wrapping.
 *
 * `EllipsisText` and `Ellipsis` are aliases of the same component.
 */
const meta = {
  title: "Components/TruncatedText",
  component: TruncatedText,
  tags: ["autodocs"],
  argTypes: {
    text: { control: "text", description: "The value. Takes precedence over `children`." },
    children: { control: false, description: "Used when `text` is absent." },
    maxLength: {
      control: { type: "number", min: 0 },
      description: "Hard character cap. Leave unset to clip by available width instead.",
    },
    showTooltip: { control: "boolean", description: "Defaults to `true`. When off, falls back to a native `title`." },
    tooltipPosition: { control: "inline-radio", options: ["top", "bottom", "left", "right"] },
    as: { control: "text", description: 'Element or component to render. Defaults to `"span"`.' },
    className: { control: "text" },
  },
  args: {
    text: LONG,
    showTooltip: true,
    tooltipPosition: "top",
  },
  render: (args) => (
    <div className="w-64 rounded-surface border border-dashed border-card-border p-3">
      <TruncatedText {...args} />
    </div>
  ),
};

export default meta;

/** Hover the text to see the full value. */
export const Playground = {};

/** Clipping to the container versus cutting at a fixed character count. */
export const ClipVersusMaxLength = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div>
        <p className="mb-1 text-body-sm text-ink-muted">By width (no `maxLength`) — 16rem container</p>
        <div className="w-64 rounded-surface border border-dashed border-card-border p-3">
          <TruncatedText text={LONG} />
        </div>
      </div>
      <div>
        <p className="mb-1 text-body-sm text-ink-muted">By width — same text, 24rem container</p>
        <div className="w-96 rounded-surface border border-dashed border-card-border p-3">
          <TruncatedText text={LONG} />
        </div>
      </div>
      <div>
        <p className="mb-1 text-body-sm text-ink-muted">`maxLength={"{30}"}` — same cut at any width</p>
        <div className="w-96 rounded-surface border border-dashed border-card-border p-3">
          <TruncatedText text={LONG} maxLength={30} />
        </div>
      </div>
    </div>
  ),
};

/** Short enough to fit: nothing is clipped and no ellipsis appears. */
export const ShortTextIsUntouched = {
  args:{
    text:"Aaxis Nano",
    showTooltip:true
  },
};

export const TooltipPositions = {
  render: () => (
    <div className="flex flex-col gap-6 py-8">
      {["top", "bottom", "left", "right"].map((pos) => (
        <div key={pos} className="w-56 rounded-surface border border-dashed border-card-border p-3">
          <TruncatedText text={`Tooltip on ${pos} — ${LONG}`} tooltipPosition={pos} />
        </div>
      ))}
    </div>
  ),
};

/** With `showTooltip={false}` a hard-truncated value falls back to the browser's native `title`. */
export const NativeTitleFallback = {
  args: { showTooltip: false, maxLength: 24 },
};

/** `as` changes the rendered element — useful for a heading or a table cell. */
export const CustomElement = {
  render: () => (
    <div className="w-64 rounded-surface border border-dashed border-card-border p-3">
      <TruncatedText as="h3" text={LONG} className="font-secondary text-title font-semibold" />
    </div>
  ),
};

/** Same component, older names. */
export const Aliases = {
  render: () => (
    <div className="flex w-64 flex-col gap-2">
      <EllipsisText text={LONG} />
      <Ellipsis text={LONG} />
    </div>
  ),
};
