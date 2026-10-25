import { cn } from "../../lib/cn";
function Footer({ className, children, ...props }) {
  return <footer
    className={cn("border-t border-card-border px-6 py-3 text-body-sm text-ink-muted", className)}
    {...props}
  >
      {children ?? `\xA9 ${(/* @__PURE__ */ new Date()).getFullYear()} my Design System \u2014 Software License System`}
    </footer>;
}
export {
  Footer
};
