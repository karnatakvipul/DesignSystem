import { Button } from "./Button";
import { ToastProvider, useToast } from "./Toast";

const meta = {
  title: "Components/Toast",
  parameters: { layout: "padded" },
};

export default meta;

function Demo() {
  const toast = useToast();
  return (
    <div className="flex flex-wrap gap-2">
      <Button size="sm" variant="add" onClick={() => toast.success("License added successfully")}>
        Success
      </Button>
      <Button size="sm" variant="danger" onClick={() => toast.error("Could not reach the server")}>
        Error
      </Button>
      <Button size="sm" variant="secondary" onClick={() => toast.warn("This license expires in 3 days")}>
        Warn
      </Button>
      <Button size="sm" variant="outline" onClick={() => toast.info("Export started")}>
        Info
      </Button>
    </div>
  );
}

/** `useToast` inside a `ToastProvider` — the usual way an app wires this up, rather than passing `toasts`/`onDismiss` by hand. */
export const Playground = {
  render: () => (
    <ToastProvider>
      <Demo />
    </ToastProvider>
  ),
};
