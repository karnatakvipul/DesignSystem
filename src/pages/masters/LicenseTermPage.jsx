import * as React from "react";
import { MasterListPage } from "./MasterListPage";
import { LicenseTermFormModal } from "../../components/feature/masters";
import { makeInitialLicenseTerms } from "../../data/mock";

/**
 * Simple list of license terms with add, edit and delete.
 *
 * Runs on local in-memory state (seeded from `initialData`, or bundled demo
 * data) unless you pass `fetcher` directly, or wrap this page in a
 * `ServerDataProvider` — it looks itself up under the `"licenseTerms"`
 * endpoint key automatically. See the `MasterListPage`/`LicensePage` docs
 * for the exact fetcher/onCreate/onUpdate/onDelete contract.
 */
export function LicenseTermPage({
  fetcher,
  serverSide,
  endpointKey = "licenseTerms",
  onCreate,
  onUpdate,
  onDelete,
  initialData,
  onToast,
}) {
  const [items, setItems] = React.useState(initialData || makeInitialLicenseTerms);
  return (
    <MasterListPage
      title="License Term"
      addLabel="Add License Term"
      items={items}
      setItems={setItems}
      FormModal={LicenseTermFormModal}
      fetcher={fetcher}
      serverSide={serverSide}
      endpointKey={endpointKey}
      onCreate={onCreate}
      onUpdate={onUpdate}
      onDelete={onDelete}
      onToast={onToast}
      columns={[{ key: "name", header: "NAME", sortable: true, render: (r) => r.name }]}
    />
  );
}
