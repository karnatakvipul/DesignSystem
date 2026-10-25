import * as React from "react";
import { Skeleton } from "./Skeleton";
import { cn } from "../../lib/cn";

function SkeletonCard({ className }) {
  return (
    <div className={cn("flex flex-col gap-3 rounded-surface border border-card-border bg-card p-4 shadow-sm w-full min-w-0", className)}>
      <div className="flex items-center justify-between border-b border-card-border/60 pb-3">
        <div className="space-y-1.5 flex-1">
          <Skeleton className="h-5 w-2/5 rounded-md" />
          <Skeleton className="h-3.5 w-1/3 rounded-md opacity-70" />
        </div>
        <Skeleton className="h-6 w-16 rounded-pill" />
      </div>
      <div className="grid grid-cols-2 gap-3 pt-1">
        <div className="space-y-1">
          <Skeleton className="h-3 w-1/2 rounded" />
          <Skeleton className="h-4 w-3/4 rounded" />
        </div>
        <div className="space-y-1">
          <Skeleton className="h-3 w-1/2 rounded" />
          <Skeleton className="h-4 w-2/3 rounded" />
        </div>
      </div>
    </div>
  );
}

export { SkeletonCard };
