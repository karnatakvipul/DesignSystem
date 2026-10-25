import * as React from "react";
import { Building2, MapPin, Tags } from "lucide-react";
import { InputField } from "../../common/InputField";
import { SectionHeading } from "../../common/FormCard";
import { FieldGrid, FieldFull, FIELD_WIDTH } from "../../common/FieldGrid";
import { AttributeListEditor } from "../../common/DynamicListEditors";

const emptyAddress = { line1: "", line2: "", line3: "", city: "", state: "", country: "", pincode: "" };

export function emptyAccountForm() {
  return { name: "", shortCode: "", description: "", address: { ...emptyAddress }, attributes: [] };
}

export function accountToForm(account) {
  if (!account) return emptyAccountForm();
  return {
    name: account.name || "",
    shortCode: account.shortCode || "",
    description: account.description || "",
    address: account.address ? { ...emptyAddress, ...account.address } : { ...emptyAddress },
    attributes: account.attributes || [],
  };
}

/** The "Add account" screen's fields, shared by the add and edit pages. */
export function AccountForm({
  value,
  onChange,
  shortCodeLocked = false,
}) {
  function set(patch) {
    onChange({ ...value, ...patch });
  }
  function setAddress(patch) {
    onChange({ ...value, address: { ...(value?.address || emptyAddress), ...patch } });
  }

  const currentAddress = value?.address || emptyAddress;

  return (
    <>
      <SectionHeading icon={<Building2 size={14} />}>Basic Information</SectionHeading>
      <FieldGrid>
        <InputField
          label="Name"
          required
          placeholder="my Design System"
          value={value?.name || ""}
          onChange={(e) => set({ name: e.target.value })}
        />
        <InputField
          label="Short code"
          required
          placeholder="m2ml"
          hint="Must be unique. Letters, digits, - or _."
          className={FIELD_WIDTH.medium}
          value={value?.shortCode || ""}
          disabled={shortCodeLocked}
          onChange={(e) => set({ shortCode: e.target.value })}
        />
        <FieldFull>
          <InputField
            label="Description"
            placeholder="my Design System application/account"
            value={value?.description || ""}
            onChange={(e) => set({ description: e.target.value })}
          />
        </FieldFull>
      </FieldGrid>

      <SectionHeading icon={<MapPin size={14} />}>Address Information</SectionHeading>
      <FieldGrid>
        <FieldFull>
          <InputField label="Line 1" placeholder="123 Main Street" value={currentAddress.line1} onChange={(e) => setAddress({ line1: e.target.value })} />
        </FieldFull>
        <InputField label="Line 2" placeholder="Building A" value={currentAddress.line2} onChange={(e) => setAddress({ line2: e.target.value })} />
        <InputField label="Line 3" placeholder="Floor 2" value={currentAddress.line3} onChange={(e) => setAddress({ line3: e.target.value })} />
        <InputField label="City" placeholder="Delhi" value={currentAddress.city} onChange={(e) => setAddress({ city: e.target.value })} />
        <InputField label="State" placeholder="IN-DL" className={FIELD_WIDTH.medium} value={currentAddress.state} onChange={(e) => setAddress({ state: e.target.value })} />
        <InputField label="Country" placeholder="India" className={FIELD_WIDTH.medium} value={currentAddress.country} onChange={(e) => setAddress({ country: e.target.value })} />
        <InputField label="Pincode" placeholder="110095" className={FIELD_WIDTH.short} value={currentAddress.pincode} onChange={(e) => setAddress({ pincode: e.target.value })} />
      </FieldGrid>

      <SectionHeading icon={<Tags size={14} />}>Additional Attributes</SectionHeading>
      <AttributeListEditor items={value?.attributes || []} onChange={(attributes) => set({ attributes })} addLabel="Add attribute" />
    </>
  );
}
