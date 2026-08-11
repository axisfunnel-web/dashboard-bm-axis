export interface ExportColumn<T> {
  header: string;
  value: (row: T) => string | number;
}

function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function escapeCsvCell(value: string | number): string {
  const s = String(value);
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** Exports rows as a CSV file (UTF-8 BOM so accented pt-BR text opens correctly in Excel) */
export function exportRowsToCsv<T>(filename: string, rows: T[], columns: ExportColumn<T>[]) {
  const header = columns.map((c) => escapeCsvCell(c.header)).join(",");
  const lines = rows.map((row) => columns.map((c) => escapeCsvCell(c.value(row))).join(","));
  const csv = [header, ...lines].join("\r\n");
  downloadBlob(filename, new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8;" }));
}

function escapeHtml(value: string | number): string {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Exports rows as a .xls file using the standard HTML-table trick — Excel (and LibreOffice/Numbers)
 * open an HTML table saved with an .xls extension + the ms-excel MIME type as a real spreadsheet.
 * Avoids depending on a binary XLSX library for a simple flat export.
 */
export function exportRowsToXls<T>(filename: string, rows: T[], columns: ExportColumn<T>[]) {
  const headerCells = columns.map((c) => `<th>${escapeHtml(c.header)}</th>`).join("");
  const bodyRows = rows
    .map(
      (row) =>
        `<tr>${columns.map((c) => `<td>${escapeHtml(c.value(row))}</td>`).join("")}</tr>`
    )
    .join("");
  const html = `<!doctype html><html><head><meta charset="utf-8"></head><body><table><thead><tr>${headerCells}</tr></thead><tbody>${bodyRows}</tbody></table></body></html>`;
  downloadBlob(filename, new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8;" }));
}
