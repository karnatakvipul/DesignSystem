import * as React from "react";
import { Bot } from "lucide-react";
import { cn } from "../../lib/cn";

/** Floating button (Super Admin only) that opens the AI license agent in a new tab. */
export function LicenseAgentButton({ onOpen, className }) {
  function handleClick() {
    if (onOpen) return onOpen();
    const w = window.open("", "_blank");
    if (w) {
      w.document.write("<title>SLS License Agent</title><body style='font-family:sans-serif;padding:40px'><h2>SLS AI License Agent</h2><p>The agent would open here.</p></body>");
    }
  }
  return (
    <button
      onClick={handleClick}
      aria-label="Open AI license agent"
      title="AI License Agent"
      className={cn(
        "fixed bottom-20 sm:bottom-24 right-4 sm:right-6 z-40 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-pill",
        "bg-accent-light text-white shadow-lg hover:brightness-110 active:scale-95 transition-all",
        className
      )}
    >
      <Bot size={22} />
    </button>
  );
}
