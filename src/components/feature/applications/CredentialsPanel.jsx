import * as React from "react";
import { Eye, EyeOff, RefreshCw, ShieldAlert } from "lucide-react";
import { Button } from "../../common/Button";
import { ConfirmDialog } from "../../common/ConfirmDialog";
import { Panel } from "../../common/Panel";

/**
 * The credentials a registered application authenticates with.
 */
export function CredentialsPanel({
  applicationId,
  clientId,
  getSecret,
  regenerateSecret,
  service,
}) {
  const [secret, setSecret] = React.useState(null);
  const [busy, setBusy] = React.useState(null);
  const [error, setError] = React.useState(null);
  const [regenerateOpen, setRegenerateOpen] = React.useState(false);

  React.useEffect(() => () => setSecret(null), []);

  const fetchSecretFn = getSecret || service?.getSecret;
  const regenSecretFn = regenerateSecret || service?.regenerateSecret;

  async function handleReveal() {
    if (secret) {
      setSecret(null);
      return;
    }
    if (!fetchSecretFn) return;
    setBusy("reveal");
    setError(null);
    try {
      const value = await fetchSecretFn(applicationId);
      if (!value) throw new Error("The server did not return a secret for this application.");
      setSecret(value);
    } catch {
      setError("Could not retrieve the client secret.");
    } finally {
      setBusy(null);
    }
  }

  async function handleConfirmRegenerate() {
    if (!regenSecretFn) return;
    setRegenerateOpen(false);
    setBusy("regenerate");
    setError(null);
    try {
      const value = await regenSecretFn(applicationId);
      setSecret(value ?? null);
      if (!value) setError("The secret was regenerated but the server did not return the new value.");
    } catch {
      setError("Could not regenerate the client secret.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <Panel variant="detail">
      {error && (
        <div role="alert" className="mb-4 rounded-control border border-status-offline bg-status-offline-bg px-4 py-3 text-body-sm text-status-offline">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-card-border pb-4">
          <div className="min-w-0">
            <div className="text-body-sm text-ink-muted">Client ID</div>
            <code className="mt-1 block truncate font-mono text-body text-ink-primary">{clientId}</code>
          </div>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <div className="text-body-sm text-ink-muted">Client Secret</div>
            <code className="mt-1 block truncate font-mono text-body text-ink-primary" aria-live="polite">
              {secret ?? "••••••••••••••••••••••••"}
            </code>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="secondary"
              icon={secret ? <EyeOff size={14} /> : <Eye size={14} />}
              disabled={busy !== null}
              onClick={handleReveal}
            >
              {secret ? "Hide" : busy === "reveal" ? "Revealing..." : "Reveal"}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              icon={<RefreshCw size={14} />}
              disabled={busy !== null}
              onClick={() => setRegenerateOpen(true)}
            >
              Regenerate
            </Button>
          </div>
        </div>

        <p className="flex items-start gap-2 rounded-control border border-status-warn bg-status-warn-bg px-3 py-2 text-body-sm text-ink-secondary">
          <ShieldAlert size={16} className="mt-0.5 shrink-0 text-status-warn" aria-hidden="true" />
          <span>Regenerating will immediately invalidate the current client secret.</span>
        </p>
      </div>

      <ConfirmDialog
        open={regenerateOpen}
        title="Regenerate client secret"
        message={`Are you sure you want to regenerate the secret for "${clientId}"? The current secret will immediately become invalid.`}
        tone="danger"
        onClose={() => setRegenerateOpen(false)}
        onConfirm={handleConfirmRegenerate}
      />
    </Panel>
  );
}
