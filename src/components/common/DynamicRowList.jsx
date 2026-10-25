import { Plus, Trash2 } from "lucide-react";
import { IconButton } from "./IconButton";
import { Button } from "./Button";
import { cn } from "../../lib/cn";
function DynamicRowList({
  items = [],
  onChange,
  createItem,
  renderRow,
  addLabel = "Add row",
  minRows = 0,
  className
}) {
  function updateRow(index, patch) {
    const next = items.slice();
    next[index] = { ...next[index], ...patch };
    onChange?.(next);
  }
  function removeRow(index) {
    onChange?.(items.filter((_, i) => i !== index));
  }
  return <div className={cn("flex flex-col gap-2", className)}>
      {(items || []).map((item, i) => <div key={i} className="flex items-center gap-2">
          <div className="flex-1">{typeof renderRow === "function" ? renderRow(item, i, (patch) => updateRow(i, patch)) : null}</div>
          <IconButton
    icon={<Trash2 size={16} />}
    label="Remove row"
    variant="danger"
    size="sm"
    disabled={items.length <= minRows}
    onClick={() => removeRow(i)}
  />
        </div>)}
      <Button variant="ghost" size="sm" icon={<Plus size={14} />} onClick={() => onChange?.([...items, createItem()])} className="self-start">
        {addLabel}
      </Button>
    </div>;
}
export {
  DynamicRowList
};
