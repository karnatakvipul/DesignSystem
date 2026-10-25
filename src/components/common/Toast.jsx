import * as React from "react";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "../../lib/cn";

const ToastContext = React.createContext(null);

function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a <ToastProvider>");
  }
  return context;
}

/**
 * Responsive Toast Component:
 * - Desktop (>= 768px): Appears in upper-RIGHT corner below header with prominent styling & close (X) button.
 * - Mobile (< 768px): Appears at bottom center with close (X) button.
 */
function Toast({ toasts = [], onDismiss, className }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <>
      {/* Desktop View (>= 768px): Upper RIGHT Corner below header */}
      <div className={cn("hidden md:flex fixed top-14 right-6 z-[100] flex-col gap-3 min-w-[320px] max-w-md pointer-events-auto", className)}>
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
        ))}
      </div>

      {/* Mobile View (< 768px): Bottom Center */}
      <div className="flex md:hidden fixed bottom-6 left-1/2 z-[100] -translate-x-1/2 flex-col gap-2 min-w-[280px] max-w-[92vw] pointer-events-auto">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
        ))}
      </div>
    </>
  );
}

function ToastItem({ toast, onDismiss }) {
  const { id, message, tone = "info", duration = 3000 } = toast;
  const [progress, setProgress] = React.useState(100);

  React.useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (elapsed >= duration) {
        clearInterval(interval);
        onDismiss(id);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [id, duration, onDismiss]);

  const icons = {
    success: <CheckCircle2 size={18} className="text-status-online shrink-0" />,
    error: <XCircle size={18} className="text-status-offline shrink-0" />,
    warn: <AlertTriangle size={18} className="text-status-warn shrink-0" />,
    info: <Info size={18} className="text-accent shrink-0" />
  };

  const borders = {
    success: "border-status-online/40",
    error: "border-status-offline/40",
    warn: "border-status-warn/40",
    info: "border-accent/40"
  };

  const progressColors = {
    success: "bg-status-online",
    error: "bg-status-offline",
    warn: "bg-status-warn",
    info: "bg-accent"
  };

  return (
    <div
      className={cn(
        "relative flex flex-col overflow-hidden rounded-surface border bg-card/95 backdrop-blur-md p-3.5 shadow-2xl transition-all duration-200 min-w-[280px] max-w-sm text-body select-none animate-in slide-in-from-bottom-4",
        borders[tone] || "border-card-border"
      )}
    >
      <div className="flex items-start gap-3">
        {icons[tone] || icons.info}
        <div className="flex-1 text-ink-primary font-medium text-body-sm sm:text-sm leading-snug">
          {message}
        </div>
        <button
          type="button"
          onClick={() => onDismiss(id)}
          className="text-ink-muted hover:text-ink-primary p-0.5 rounded cursor-pointer shrink-0 transition-colors"
          aria-label="Dismiss toast"
        >
          <X size={14} />
        </button>
      </div>

      {/* Animated Linear Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-card-border/40 overflow-hidden">
        <div
          className={cn("h-full transition-all ease-linear", progressColors[tone] || "bg-accent")}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

function ToastProvider({ children }) {
  const [toasts, setToasts] = React.useState([]);

  const dismiss = React.useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = React.useCallback((message, options = {}) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    const newToast = { id, message, tone: options.tone || "info", duration: options.duration || 3000 };
    setToasts((prev) => [...prev, newToast]);
    return id;
  }, []);

  const toastMethods = React.useMemo(() => {
    const api = (msg, opts) => show(msg, opts);
    api.show = show;
    api.success = (msg, opts) => show(msg, { ...opts, tone: "success" });
    api.error = (msg, opts) => show(msg, { ...opts, tone: "error" });
    api.warn = (msg, opts) => show(msg, { ...opts, tone: "warn" });
    api.info = (msg, opts) => show(msg, { ...opts, tone: "info" });
    api.dismiss = dismiss;
    return api;
  }, [show, dismiss]);

  return (
    <ToastContext.Provider value={toastMethods}>
      {children}
      <Toast toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export { Toast, ToastItem, ToastProvider, useToast };
