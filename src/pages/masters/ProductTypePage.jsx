import * as React from "react";
import { MasterListPage } from "./MasterListPage";
import { ProductTypeFormModal } from "../../components/feature/masters";
import { makeInitialProductTypes } from "../../data/mock";

/**
 * Lists products with add, edit, delete, activate and deactivate.
 *
 * Runs on local in-memory state (seeded from `initialData`, or bundled demo
 * data) unless you pass `fetcher` directly, or wrap this page in a
 * `ServerDataProvider` — it looks itself up under the `"productTypes"`
 * endpoint key automatically. See the `MasterListPage`/`LicensePage` docs
 * for the exact fetcher/onCreate/onUpdate/onDelete contract.
 */
export function ProductTypePage({
  fetcher,
  serverSide,
  endpointKey = "productTypes",
  onCreate,
  onUpdate,
  onDelete,
  initialData,
  onToast,
}) {
  const [items, setItems] = React.useState(initialData || makeInitialProductTypes);
  return (
    <MasterListPage
      title="Product Type"
      addLabel="Add Product"
      items={items}
      setItems={setItems}
      FormModal={ProductTypeFormModal}
      showStatusToggle
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
