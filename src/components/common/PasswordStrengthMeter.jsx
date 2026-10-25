import { cn } from "../../lib/cn";
function scorePassword(password) {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 1) return { score, label: "Weak", tone: "bg-status-offline" };
  if (score <= 3) return { score, label: "Medium", tone: "bg-status-warn" };
  return { score, label: "Strong", tone: "bg-status-online" };
}
function PasswordStrengthMeter({ password, className }) {
  if (!password) return null;
  const { score, label, tone } = scorePassword(password);
  const pct = Math.min(score / 5 * 100, 100);
  return <div className={cn("mt-2", className)}>
      <div className="h-1.5 w-full overflow-hidden rounded-pill bg-card-border">
        <div className={cn("h-full rounded-pill transition-all duration-200", tone)} style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-1 text-body-sm text-ink-secondary">Strength: {label}</p>
    </div>;
}
export {
  PasswordStrengthMeter
};
