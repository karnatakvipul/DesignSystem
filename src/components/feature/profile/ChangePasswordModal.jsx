import * as React from "react";
import { FormModal } from "../../common/FormModal";
import { PasswordInput } from "../../common/PasswordInput";
import { PasswordStrengthMeter } from "../../common/PasswordStrengthMeter";
import { ValidationMessage } from "../../common/ValidationMessage";

/**
 * Popup to set a new password with confirm and strength rules.
 *
 * @param {Object} props
 * @param {boolean} props.open
 * @param {Function} props.onClose
 * @param {(password: string, currentPassword: string) => void} props.onSave
 *   Receives the new password. The second argument carries the current one
 *   when `requireCurrent` is set, and is an empty string otherwise — so
 *   callers written against the old single-argument signature keep working.
 * @param {boolean} [props.requireCurrent=false]
 *   Ask for the existing password before allowing a change. Off by default so
 *   this stays backwards compatible, but worth turning on for self-service
 *   changes: a live session alone shouldn't let an unattended machine lock the
 *   real owner out of their account.
 */
export function ChangePasswordModal({ open, onClose, onSave, requireCurrent = false }) {
  const [current, setCurrent] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const mismatch = confirm.length > 0 && confirm !== password;
  const missingCurrent = requireCurrent && !current.trim();

  React.useEffect(() => {
    if (open) { setCurrent(""); setPassword(""); setConfirm(""); }
  }, [open]);

  return (
    <FormModal
      open={open}
      onClose={onClose}
      onSubmit={() => { onSave(password, current); }}
      title="Change Password"
      size="sm"
      submitDisabled={!password.trim() || mismatch || missingCurrent}
    >
      {requireCurrent && (
        <div>
          <PasswordInput
            label="Current Password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            autoComplete="current-password"
          />
        </div>
      )}
      <div>
        <PasswordInput label="New Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <PasswordStrengthMeter password={password} />
      </div>
      <div>
        <PasswordInput label="Confirm Password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        <ValidationMessage>{mismatch ? "Passwords do not match" : ""}</ValidationMessage>
      </div>
    </FormModal>
  );
}
