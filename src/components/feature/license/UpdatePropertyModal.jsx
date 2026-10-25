import * as React from "react";
import { FormModal } from "../../common/FormModal";
import { Dropdown } from "../../common/Dropdown";
import { InputField } from "../../common/InputField";

const NONE_OPTION = { value: " ", label: "None" };

/**
 * Assigns a licence to an Account, a Site (or a raw Device when it has no
 * site), and — for EnviroFront and OCEMS licences — an EF Account and a
 * parent licence to link to.
 *
 * Site and Device are mutually exclusive, matching the reference app: picking
 * one clears and disables the other, because a licence's property is stored
 * against one or the other, never both — offering both as live at once would
 * let someone fill in something that gets silently dropped on save.
 *
 * EF Account and Link License only appear for EnviroFront (`EF…`) and OCEMS
 * (`OC…`) licence types — confirmed against the reference's own
 * `dlgUpdateProperty`, which shows exactly these fields for an OCEMS licence
 * and hides EF Account for an EnviroFront one. A licence type outside those
 * two families gets neither field, since neither concept applies to it.
 */
export function UpdatePropertyModal({
  open,
  onClose,
  onSave,
  license,
  accounts = [],
  sitesByAccount = {},
  efAccounts = [],
  linkLicenseOptions = [],
}) {
  const [account, setAccount] = React.useState(null);
  const [site, setSite] = React.useState(null);
  const [device, setDevice] = React.useState("");
  const [efAccount, setEfAccount] = React.useState(null);
  const [parentLicense, setParentLicense] = React.useState(" ");

  const type = license?.type ?? "";
  const isOcems = type.startsWith("OC");
  const isEnviroFront = type.startsWith("EF");
  const showEfAccount = isOcems;
  const showLinkLicense = isOcems || isEnviroFront;

  // Reset from the license being edited every time the modal opens, so a
  // previous license's values are never submitted against a different one.
  React.useEffect(() => {
    if (!open) return;
    setAccount(license?.account ?? null);
    setSite(license?.site ?? null);
    setDevice(license?.device ?? "");
    setEfAccount(license?.efAccount ?? null);
    setParentLicense(license?.parentLicense ?? " ");
  }, [open, license]);

  const siteOptions = (account && sitesByAccount[account]) || [];

  function chooseSite(v) {
    setSite(v);
    if (v) setDevice("");
  }

  function chooseDevice(v) {
    setDevice(v);
    if (v) setSite(null);
  }

  return (
    <FormModal
      open={open}
      onClose={onClose}
      onSubmit={() =>
        onSave({
          account,
          site,
          device: site ? null : device || null,
          efAccount: showEfAccount ? efAccount : null,
          parentLicense: showLinkLicense && parentLicense !== " " ? parentLicense : null,
        })
      }
      title="Update Property"
      submitDisabled={!account || (!site && !device)}
    >
      <Dropdown
        label="Account"
        required
        options={accounts}
        value={account}
        onChange={(v) => {
          setAccount(v);
          // A site belongs to one account; switching accounts invalidates
          // whichever one was picked for the last one.
          setSite(null);
        }}
      />

      <InputField
        label="Device"
        required={!site}
        placeholder="Device serial or identifier"
        value={device}
        onChange={(e) => chooseDevice(e.target.value)}
        disabled={!!site}
      />

      <Dropdown
        label="Site"
        required={!device}
        placeholder={account ? "Select a site" : "Select an account first"}
        options={siteOptions}
        value={site}
        onChange={chooseSite}
        disabled={!account || !!device}
      />

      {showEfAccount && (
        <Dropdown label="EF Account" options={efAccounts} value={efAccount} onChange={setEfAccount} />
      )}

      {showLinkLicense && (
        <Dropdown
          label="Link License"
          options={[NONE_OPTION, ...linkLicenseOptions]}
          value={parentLicense}
          onChange={setParentLicense}
        />
      )}
    </FormModal>
  );
}
