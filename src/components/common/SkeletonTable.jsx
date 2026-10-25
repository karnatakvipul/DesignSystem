import * as React from "react";
import { Skeleton } from "./Skeleton";
import { cn } from "../../lib/cn";

function SkeletonTable({ rows = 5, columns = 4, className }) {
  return (
    <div className={cn("overflow-x-auto rounded-control border border-card-border bg-card w-full min-w-0", className)}>
      <table className="w-full text-left text-body">
        <thead>
          <tr className="border-b border-card-border bg-canvas">
            {Array.from({ length: columns }).map((_, cIdx) => (
              <th key={cIdx} className="px-4 py-3">
                <Skeleton className="h-4 w-24 rounded-md" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rIdx) => (
            <tr key={rIdx} className="border-b border-card-border last:border-0">
              {Array.from({ length: columns }).map((_, cIdx) => (
                <td key={cIdx} className="px-4 py-3">
                  <Skeleton
                    className={cn(
                      "h-4 rounded-md",
                      cIdx === 0 ? "w-36" : cIdx === 1 ? "w-24" : cIdx === 2 ? "w-16" : "w-28"
                    )}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export { SkeletonTable };
