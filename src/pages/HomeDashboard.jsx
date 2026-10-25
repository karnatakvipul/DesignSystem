import * as React from "react";
import { Panel } from "../components/common/Panel";
import { Dropdown } from "../components/common/Dropdown";
import { makeMaterialsData } from "../data/mock";
import { useServerDataBinding } from "../lib/useServerDataBinding";
import { useServerDataContext } from "../lib/ServerDataProvider";

import { MobileTableWrapper } from "../components/common/MobileTableWrapper";

/**
 * Materials-by-customer summary screen.
 *
 * Three ways to feed it data, checked in this order:
 * 1. Pass a static `data` array directly — renders exactly what you give it, no fetching.
 * 2. Pass `fetcher`, or wrap this page in a `ServerDataProvider` (it looks itself
 *    up under the `"materials"` endpoint key automatically) — enables live
 *    server-side fetching, with the customer dropdown sent through as a filter.
 * 3. Neither — falls back to bundled local demo data.
 */
export function HomeDashboard({ data, fetcher: propFetcher, serverSide: propServerSide, endpointKey = "materials", onRetry }) {
  const [customer, setCustomer] = React.useState(null);

  const context = useServerDataContext();
  const contextFetcher = context?.getEndpointFetcher?.(endpointKey);
  const activeFetcher = propFetcher || contextFetcher;
  // A static `data` array always wins — it's the simplest "just render this" path.
  const isServerSide = data == null && (propServerSide ?? !!activeFetcher);

  const serverBinding = useServerDataBinding({
    fetcher: activeFetcher || (() => Promise.resolve({ data: [], total: 0 })),
    autoFetch: isServerSide,
  });

  // Destructured because `serverBinding` is a new object every render and
  // cannot go in a dependency array without looping. These setters are stable,
  // so the effects below can depend on exactly what they use.
  const { setFilter: serverSetFilter } = serverBinding;

  React.useEffect(() => {
    if (isServerSide) {
      serverSetFilter("customer", customer);
    }
  }, [customer, isServerSide, serverSetFilter]);

  const localMaterials = React.useMemo(() => data || makeMaterialsData(), [data]);

  const materials = isServerSide ? serverBinding.data : localMaterials;
  const loading = isServerSide ? serverBinding.loading : false;
  const error = isServerSide ? serverBinding.error : null;

  // In local/demo mode the customer list comes from the loaded rows; in
  // server mode you'd normally source this from a small "distinct customers"
  // endpoint of your own, since only the current page of rows is loaded
  // client-side — falling back to the currently-loaded rows here is a
  // reasonable default until you wire that up.
  const customers = [...new Set(materials.map((m) => m.customer))];
  const filtered = isServerSide || !customer ? materials : materials.filter((m) => m.customer === customer);

  const dataTableColumns = [
    { key: "customer", header: "CUSTOMER", render: (r) => r.customer },
    { key: "material", header: "MATERIAL", render: (r) => r.material },
    { key: "qty", header: "QTY", align: "right", render: (r) => r.qty },
  ];

  return (
    <div className="flex flex-col gap-4 w-full min-w-0">
      <Panel title="Home">
        <div className="mb-4 max-w-xs">
          <Dropdown
            label="Customer"
            placeholder="All customers"
            options={customers.map((c) => ({ value: c, label: c }))}
            value={customer}
            onChange={setCustomer}
          />
        </div>
        <MobileTableWrapper
          columns={dataTableColumns}
          data={filtered}
          loading={loading}
          error={error}
          onRetry={isServerSide ? serverBinding.refetch : onRetry}
          rowKey={(r) => r.id}
          primaryFields={["customer", "material", "qty"]}
          emptyMessage="No material records found."
        />
      </Panel>
    </div>
  );
}
