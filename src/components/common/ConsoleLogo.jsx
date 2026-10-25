import * as React from "react";
import { cn } from "../../lib/cn";

/** my Design System's mark: a rounded-square "M2M" badge plus the "my Design System" wordmark. */
export function ConsoleLogo({
  collapsed = false,
  className,
}) {
  const mark = (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-control bg-accent text-[10px] font-extrabold leading-none text-white">
      M2M
    </div>
  );

  if (collapsed) {
    return <div className={cn("flex items-center justify-center", className)}>{mark}</div>;
  }

  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      {mark}
      <span className="text-base font-extrabold tracking-tight">my Design System</span>
    </div>
  );
}

