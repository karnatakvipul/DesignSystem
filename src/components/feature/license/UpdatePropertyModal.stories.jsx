import * as React from "react";
import { UpdatePropertyModal } from "./UpdatePropertyModal";
import { Button } from "../../common/Button";

const ACCOUNTS = [
  { value: "Aaxis Nano", label: "Aaxis Nano" },
  { value: "Abc Industries Pvt Ltd", label: "Abc Industries Pvt Ltd" },
  { value: "Prima Equipment", label: "Prima Equipment" },
];

const SITES_BY_ACCOUNT = {
  "Aaxis Nano": [{ value: "Gmr Airport Hyderabad", label: "Gmr Airport Hyderabad" }],
  "Abc Industries Pvt Ltd": [
    { value: "Noida Plant 1", label: "Noida Plant 1" },
    { value: "Noida Plant 2", label: "Noida Plant 2" },
    { value: "Noida Plant 3", label: "Noida Plant 3" },
  ],
  "Prima Equipment": [{ value: "Pcc_Borivali", label: "Pcc_Borivali" }],
};

const EF_ACCOUNTS = [
  { value: "Aaxis Nano", label: "Aaxis Nano" },
  { value: "Abc Industries Pvt Ltd", label: "Abc Industries Pvt Ltd" },
];

const LINK_OPTIONS = [
  { value: "6209020c-ac5c-4388", label: "Gmr Airport Hyderabad: Aemb Domestic Tank Terminal" },
  { value: "a298070a-f9fa-4ee3", label: "Manufacturing - Noida Plant 1" },
];

const LICENSE = {
  id: 1,
  account: "Abc Industries Pvt Ltd",
  site: "Noida Plant 2",
  type: "EF-1Y-5M-1Y-PR-XX",
  device: "7135e7b4-A",
};

/**
 * Re-points a licence at a different account, site, device or parent licence.
 *
 * Sites are keyed by account (`sitesByAccount`), so choosing an account
 * narrows the site list to that account's sites — a flat list would let you
 * attach a licence to a site its owner does not have.
 *
 * `efAccounts` and `linkLicenseOptions` drive the EnviroFRONT-specific fields,
 * which only apply to some licence types.
 */
const meta = {
  title: "Feature/License/UpdatePropertyModal",
  component: UpdatePropertyModal,
  tags: ["autodocs"],
  argTypes: {
    open: { control: "boolean" },
    onClose: { action: "closed" },
    onSave: { action: "saved", description: "Receives `{ account, site, device, efAccount, parentLicense }`." },
    license: { control: "object", description: "The licence being re-pointed — seeds the fields." },
    accounts: { control: "object", description: "`{ value, label }[]`." },
    sitesByAccount: { control: "object", description: "Account name → its sites, so the site list narrows." },
    efAccounts: { control: "object", description: "Accounts eligible for the EnviroFRONT link." },
    linkLicenseOptions: { control: "object", description: "Licences this one may be parented to." },
  },
  args: {
    open: true,
    license: LICENSE,
    accounts: ACCOUNTS,
    sitesByAccount: SITES_BY_ACCOUNT,
    efAccounts: EF_ACCOUNTS,
    linkLicenseOptions: LINK_OPTIONS,
  },
};

export default meta;

/** Change the account and watch the site list narrow to that account's sites. */
export const Playground = {};

/** An account with a single site. */
export const SingleSiteAccount = {
  args: { license: { ...LICENSE, account: "Aaxis Nano", site: "Gmr Airport Hyderabad" } },
};

/** With no parent licences on offer, the link field has nothing to choose. */
export const NoLinkableLicences = { args: { linkLicenseOptions: [] } };

export const Interactive = {
  render: function Render() {
    const [open, setOpen] = React.useState(false);
    const [saved, setSaved] = React.useState(null);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Update property</Button>
        <pre className="mt-3 rounded-control bg-chrome-deep/40 p-3 font-mono text-body-sm text-ink-secondary">
          {saved ? JSON.stringify(saved, null, 2) : "(nothing saved yet)"}
        </pre>
        <UpdatePropertyModal
          open={open}
          license={LICENSE}
          accounts={ACCOUNTS}
          sitesByAccount={SITES_BY_ACCOUNT}
          efAccounts={EF_ACCOUNTS}
          linkLicenseOptions={LINK_OPTIONS}
          onClose={() => setOpen(false)}
          onSave={(values) => {
            setSaved(values);
            setOpen(false);
          }}
        />
      </>
    );
  },
};
