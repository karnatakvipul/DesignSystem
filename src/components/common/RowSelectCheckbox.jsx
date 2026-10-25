import * as React from "react";
import { Checkbox } from "./Checkbox";

/**
 * Table row / header selection checkbox.
 *
 * Checkbox itself owns the `indeterminate` DOM property, so this is just a
 * thin, accessibly-labelled wrapper over it.
 */
function RowSelectCheckbox({ checked, indeterminate, onChange, label = "Select row" }) {
  return (
    <Checkbox
      checked={checked}
      indeterminate={indeterminate}
      onChange={(e) => onChange?.(e)}
      aria-label={label}
    />
  );
}

export { RowSelectCheckbox };
