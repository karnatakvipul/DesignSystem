import * as React from "react";

/** Shows the renewal Excel sheet as an HTML table. */
export function ExcelPreviewViewer({ rows = [] }) {
  if (rows.length === 0) {
    return <p className="text-body text-ink-muted">No renewal Excel data to preview.</p>;
  }
  const firstRow = rows.find((r) => r && typeof r === "object");
  if (!firstRow) {
    return <p className="text-body text-ink-muted">No renewal Excel data to preview.</p>;
  }
  const headers = Object.keys(firstRow);
  return (
    <div className="overflow-x-auto rounded border border-card-border">
      <table className="w-full text-left text-body">
        <thead>
          <tr className="border-b border-card-border bg-canvas">
            {headers.map((h) => (
              <th key={h} className="px-3 py-2 font-medium text-ink-secondary">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-card-border last:border-0">
              {headers.map((h) => (
                <td key={h} className="px-3 py-2 text-ink-primary">{String(r?.[h] ?? "")}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
