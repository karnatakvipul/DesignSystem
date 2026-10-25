import * as React from "react";
import { MasterListPage } from "./MasterListPage";
import { LicenseTypeFormModal } from "../../components/feature/masters";
import { makeInitialLicenseTypes } from "../../data/mock";

/**
 * Lists license types with add, edit and delete.
 *
 * Runs on local in-memory state (seeded from `initialData`, or bundled demo
 * data) unless you pass `fetcher` directly, or wrap this page in a
 * `ServerDataProvider` — it looks itself up under the `"licenseTypes"`
 * endpoint key automatically, same as `MasterListPage` does when used
 * directly. See the `MasterListPage`/`LicensePage` docs for the exact
 * fetcher/onCreate/onUpdate/onDelete contract.
 */
export function LicenseTypePage({
  fetcher,
  serverSide,
  endpointKey = "licenseTypes",
  onCreate,
  onUpdate,
  onDelete,
  initialData,
  onToast,
}) {
  const [items, setItems] = React.useState(initialData || makeInitialLicenseTypes);
  return (
    <MasterListPage
      title="License Type"
      addLabel="Add License Type"
      items={items}
      setItems={setItems}
      FormModal={LicenseTypeFormModal}
      fetcher={fetcher}
      serverSide={serverSide}
      endpointKey={endpointKey}
      onCreate={onCreate}
      onUpdate={onUpdate}
      onDelete={onDelete}
      onToast={onToast}
      columns={[
        {
          key: "name",
          header: "NAME",
          sortable: true,
          width: "240px",
          minWidth: 200,
          truncate: true,
          render: (r) => (
            <span className="text-accent hover:underline cursor-pointer font-medium">
              {r.name}
            </span>
          ),
        },
        {
          key: "description",
          header: "DESCRIPTION",
          sortable: true,
          width: "480px",
          minWidth: 350,
          truncate: true,
        },
        {
          key: "product",
          header: "PRODUCT",
          sortable: true,
          width: "180px",
          minWidth: 140,
          truncate: true,
        },
        {
          key: "productType",
          header: "PRODUCT TYPE",
          sortable: true,
          width: "180px",
          minWidth: 140,
          truncate: true,
        },
      ]}
    />
  );
}
