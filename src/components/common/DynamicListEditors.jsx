import * as React from "react";
import { DynamicRowList } from "./DynamicRowList";
import { InputField } from "./InputField";

/** A flat list of strings edited one InputField per row. */
export function StringListEditor({
  items = [],
  onChange,
  placeholder,
  addLabel = "Add",
  minRows = 0,
}) {
  return (
    <DynamicRowList
      items={items.map((value) => ({ value }))}
      onChange={(rows) => onChange?.(rows.map((r) => r.value))}
      createItem={() => ({ value: "" })}
      addLabel={addLabel}
      minRows={minRows}
      renderRow={(item, _i, update) => (
        <InputField
          value={item.value}
          placeholder={placeholder}
          onChange={(e) => update({ value: e.target.value })}
        />
      )}
    />
  );
}

/** Key/value pairs — Custom Attributes, Additional Attributes. */
export function AttributeListEditor({
  items = [],
  onChange,
  addLabel = "Add attribute",
}) {
  return (
    <DynamicRowList
      items={items}
      onChange={onChange}
      createItem={() => ({ key: "", value: "" })}
      addLabel={addLabel}
      renderRow={(item, _i, update) => (
        <div className="flex flex-1 gap-2">
          <InputField placeholder="Key" value={item.key} onChange={(e) => update({ key: e.target.value })} />
          <InputField placeholder="Value" value={item.value} onChange={(e) => update({ value: e.target.value })} />
        </div>
      )}
    />
  );
}

/** Name/path pairs — the extra endpoint rows. */
export function EndpointExtraEditor({
  items = [],
  onChange,
  addLabel = "Add endpoint",
}) {
  return (
    <DynamicRowList
      items={items}
      onChange={onChange}
      createItem={() => ({ name: "", path: "" })}
      addLabel={addLabel}
      renderRow={(item, _i, update) => (
        <div className="flex flex-1 gap-2">
          <InputField placeholder="Endpoint name" value={item.name} onChange={(e) => update({ name: e.target.value })} />
          <InputField placeholder="/api/…" value={item.path} onChange={(e) => update({ path: e.target.value })} />
        </div>
      )}
    />
  );
}

