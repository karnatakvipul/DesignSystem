import * as React from "react";
import { MoreVertical } from "lucide-react";
import { IconButton } from "./IconButton";
import { ContextMenu } from "./ContextMenu";

/**
 * The "⋮" button every table row (or card header) needs for actions that
 * don't fit as inline icons — replaces a row of competing icon buttons with
 * one trigger and a floating menu anchored under it.
 *
 * `ContextMenu` already renders that floating menu, but only anchors at an
 * explicit x/y point (the right-click model). This measures its own trigger
 * button and opens `ContextMenu` beneath it instead, so every screen with a
 * row-actions column gets the same trigger-plus-anchoring logic rather than
 * re-deriving it per page.
 *
 * @param {Object} props
 * @param {Array<{label: string, icon?: React.ReactNode, danger?: boolean, disabled?: boolean, onClick: () => void}>} props.items
 * @param {string} [props.label="More actions"] Accessible name for the trigger button — pass something specific ("Actions for John Smith") on a row of many.
 * @param {"start"|"end"} [props.align="end"] Which edge of the trigger the menu's left edge starts from. "end" (the default) suits a trailing actions column; `ContextMenu`'s own viewport clamp keeps it on-screen either way.
 * @param {"xs"|"sm"|"md"} [props.size="sm"] Forwarded to the trigger `IconButton`.
 * @param {React.ReactNode} [props.icon] Trigger icon, defaults to a vertical "more" glyph.
 */
function ActionMenu({ items = [], label = "More actions", align = "end", size = "sm", icon }) {
  const [open, setOpen] = React.useState(false);
  const [coords, setCoords] = React.useState({ x: 0, y: 0 });
  const triggerRef = React.useRef(null);

  function openMenu() {
    const rect = triggerRef.current?.getBoundingClientRect();
    setCoords({
      x: rect ? (align === "start" ? rect.left : rect.right) : 0,
      y: rect ? rect.bottom + 4 : 0,
    });
    setOpen(true);
  }

  return (
    <>
      <IconButton
        ref={triggerRef}
        icon={icon ?? <MoreVertical size={16} />}
        label={label}
        size={size}
        onClick={openMenu}
      />
      <ContextMenu open={open} x={coords.x} y={coords.y} items={items} onClose={() => setOpen(false)} />
    </>
  );
}

export { ActionMenu };

