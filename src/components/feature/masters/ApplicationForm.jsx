import * as React from "react";
import { Boxes, Link2, Tags } from "lucide-react";
import { InputField } from "../../common/InputField";
import { SectionHeading } from "../../common/FormCard";
import { FieldGrid, FieldFull } from "../../common/FieldGrid";
import { StringListEditor, AttributeListEditor, EndpointExtraEditor } from "../../common/DynamicListEditors";

const emptyEndpoints = {
  openApi: "",
  keycloakAccountRef: "",
  keycloakUserRef: "",
  role: "",
  permission: "",
  userRole: "",
  permissionRole: "",
  extra: [],
};

export function emptyApplicationForm() {
  return { clientId: "", name: "", description: "", urls: [""], endpoints: { ...emptyEndpoints }, attributes: [] };
}

export function applicationToForm(app) {
  if (!app) return emptyApplicationForm();
  return {
    clientId: app.clientId || "",
    name: app.name || "",
    description: app.description || "",
    urls: app.urls?.length ? app.urls : [""],
    endpoints: app.endpoints ? { ...emptyEndpoints, ...app.endpoints } : { ...emptyEndpoints },
    attributes: app.attributes || [],
  };
}

/**
 * The "Add application" screen's fields, shared by the add and edit pages.
 */
export function ApplicationForm({
  value,
  onChange,
  idLocked = false,
}) {
  function set(patch) {
    onChange({ ...value, ...patch });
  }
  function setEndpoint(patch) {
    onChange({ ...value, endpoints: { ...(value?.endpoints || emptyEndpoints), ...patch } });
  }

  const endpoints = value?.endpoints || emptyEndpoints;

  return (
    <>
      <SectionHeading icon={<Boxes size={14} />}>Application</SectionHeading>

      <FieldGrid>
        <InputField
          label="Client ID"
          required
          placeholder="sls-app"
          hint="Lowercase letters, digits, - or _."
          value={value?.clientId || ""}
          disabled={idLocked}
          onChange={(e) => set({ clientId: e.target.value })}
        />
        <InputField
          label="Name"
          required
          placeholder="SLS"
          value={value?.name || ""}
          onChange={(e) => set({ name: e.target.value })}
        />
        <FieldFull>
          <InputField
            label="Description"
            placeholder="SLS Application"
            value={value?.description || ""}
            onChange={(e) => set({ description: e.target.value })}
          />
        </FieldFull>
      </FieldGrid>

      <div className="flex flex-col gap-1.5">
        <label className="text-body-sm font-medium text-ink-secondary">
          Application URLs <span className="text-status-offline">*</span>
        </label>
        <StringListEditor
          items={value?.urls || [""]}
          onChange={(urls) => set({ urls })}
          placeholder="http://localhost:3101"
          addLabel="Add"
          minRows={1}
        />
      </div>

      <SectionHeading icon={<Link2 size={14} />}>Endpoints</SectionHeading>

      <FieldGrid>
        <InputField
          label="OpenAPI / Swagger"
          placeholder="/swagger/v1/swagger.json"
          value={endpoints.openApi || ""}
          onChange={(e) => setEndpoint({ openApi: e.target.value })}
        />
        <InputField
          label="Keycloak Account Ref"
          placeholder="/api/kc-references/accounts"
          value={endpoints.keycloakAccountRef || ""}
          onChange={(e) => setEndpoint({ keycloakAccountRef: e.target.value })}
        />
        <InputField
          label="Keycloak User Ref"
          placeholder="/api/kc-references/users"
          value={endpoints.keycloakUserRef || ""}
          onChange={(e) => setEndpoint({ keycloakUserRef: e.target.value })}
        />
        <InputField
          label="Role"
          placeholder="/api/roles"
          value={endpoints.role || ""}
          onChange={(e) => setEndpoint({ role: e.target.value })}
        />
        <InputField
          label="Permission"
          placeholder="/api/permissions"
          value={endpoints.permission || ""}
          onChange={(e) => setEndpoint({ permission: e.target.value })}
        />
        <InputField
          label="User Role"
          placeholder="/api/user-roles"
          value={endpoints.userRole || ""}
          onChange={(e) => setEndpoint({ userRole: e.target.value })}
        />
        <InputField
          label="Permission Role"
          placeholder="/api/permission-roles"
          value={endpoints.permissionRole || ""}
          onChange={(e) => setEndpoint({ permissionRole: e.target.value })}
        />
      </FieldGrid>

      <div className="flex flex-col gap-1.5">
        <label className="text-body-sm font-medium text-ink-secondary">Additional endpoints</label>
        <EndpointExtraEditor items={endpoints.extra || []} onChange={(extra) => setEndpoint({ extra })} />
      </div>

      <SectionHeading icon={<Tags size={14} />}>Custom Attributes</SectionHeading>
      <AttributeListEditor items={value?.attributes || []} onChange={(attributes) => set({ attributes })} addLabel="Add attribute" />
    </>
  );
}
