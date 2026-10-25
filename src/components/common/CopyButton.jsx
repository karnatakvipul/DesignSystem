import * as React from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "../../lib/cn";
import { Tooltip } from "./Tooltip";

/**
 * CopyButton Component.
 * Standalone reusable copy button component for copying text to clipboard with feedback tooltip.
 *
 * @param {Object} props
 * @param {string} [props.text] Text to copy to clipboard
 * @param {string} [props.value] Alternative prop for text to copy
 * @param {string} [props.label] Optional text label shown next to icon
 * @param {Function} [props.onCopy] Callback function after text is copied
 * @param {number} [props.size=14] Icon size in pixels
 * @param {string} [props.tooltipText="Copy to clipboard"] Tooltip text before copy
 * @param {string} [props.copiedText="Copied!"] Tooltip text after copy
 * @param {string} [props.className] Additional CSS classes
 */
export function CopyButton({
  text,
  value,
  label,
  onCopy,
  size = 14,
  tooltipText = "Copy to clipboard",
  copiedText = "Copied!",
  className,
  ...props
}) {
  const [copied, setCopied] = React.useState(false);
  const textToCopy = text ?? value ?? "";

  async function handleCopy(e) {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (!textToCopy) return;

    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        // Fallback for legacy DOM environments
        const textArea = document.createElement("textarea");
        textArea.value = textToCopy;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setCopied(true);
      onCopy?.(textToCopy);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore copy error
    }
  }

  return (
    <div className="shrink-0 inline-flex items-center justify-center min-w-[24px] min-h-[24px] relative z-10">
      <Tooltip content={copied ? copiedText : tooltipText} position="top">
        <button
          type="button"
          onClick={handleCopy}
          className={cn(
            "inline-flex items-center justify-center h-6 w-6 rounded-md text-ink-muted hover:text-accent hover:bg-accent-muted/40 transition-colors cursor-pointer shrink-0 select-none",
            copied && "text-status-online hover:text-status-online font-semibold",
            className
          )}
          aria-label={label || tooltipText}
          {...props}
        >
          {copied ? (
            <Check size={size} className="text-status-online shrink-0" />
          ) : (
            <Copy size={size} className="shrink-0" />
          )}
          {label && <span className="text-body-sm ml-1">{label}</span>}
        </button>
      </Tooltip>
    </div>
  );
}

/**
 * CopyableText Component.
 * Convenience wrapper displaying text next to an integrated CopyButton.
 *
 * @param {Object} props
 * @param {string} props.text Text to display and copy
 * @param {boolean} [props.truncate=true] Truncate long text with ellipsis
 * @param {string} [props.className] Container CSS classes
 * @param {number} [props.size=14] Copy button icon size
 */
export function CopyableText({
  text,
  truncate = true,
  className,
  size = 14,
}) {
  return (
    <div className={cn("inline-flex items-center gap-1.5 max-w-full overflow-hidden", className)}>
      <span className={cn("text-body-sm text-ink-primary font-mono", truncate && "truncate")} title={text}>
        {text}
      </span>
      <CopyButton text={text} size={size} />
    </div>
  );
}
