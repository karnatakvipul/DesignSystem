import { AlertCircle } from "lucide-react";
import { cn } from "../../lib/cn";
function ValidationMessage({ children, className, ...props }) {
  if (!children) return null;
  return <p className={cn("mt-1 flex items-center gap-1 text-body-sm text-status-offline", className)} {...props}>
      <AlertCircle size={12} className="shrink-0" />
      {children}
    </p>;
}
export {
  ValidationMessage
};
