import { cn } from "../../lib/cn";

function MainLayout({ sidebar, header, footer, children, className }) {
  return (
    <div className={cn("flex h-[100dvh] w-full overflow-hidden bg-canvas", className)}>
      {sidebar}
      <div className="flex min-w-0 flex-1 flex-col h-full overflow-hidden">
        {header}
        <main className="flex-1 min-h-0 flex flex-col overflow-hidden p-1.5 sm:p-2 min-w-0">{children}</main>
        {footer}
      </div>
    </div>
  );
}

export { MainLayout };