/**
 * Built-in Data Export Helpers for my Design System.
 */

export function exportToCSV(data = [], columns = [], filename = "export.csv") {
  if (typeof window === "undefined") return;
  if (!data || data.length === 0) return;

  // Determine headers & keys
  const cols =
    columns.length > 0
      ? columns
      : Object.keys(data[0] || {}).map((k) => ({ key: k, header: k }));

  const headers = cols.map((c) => `"${String(c.header || c.key).replace(/"/g, '""')}"`);

  const rows = data.map((row) => {
    return cols
      .map((c) => {
        let val = row[c.key];
        if (val === undefined || val === null) val = "";
        if (typeof val === "object") val = JSON.stringify(val);
        return `"${String(val).replace(/"/g, '""')}"`;
      })
      .join(",");
  });

  const csvContent = [headers.join(","), ...rows].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename.endsWith(".csv") ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportToJSON(data = [], filename = "export.json") {
  if (typeof window === "undefined") return;
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename.endsWith(".json") ? filename : `${filename}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
