/**
 * CSV Export Utility
 * Converts data to CSV format and triggers browser download
 */

export interface CSVColumn {
  key: string;
  label: string;
  format?: (value: any) => string;
}

export interface CSVExportOptions {
  filename?: string;
  columns: CSVColumn[];
  data: Record<string, any>[];
}

/**
 * Escapes special CSV characters and wraps in quotes if needed
 */
function escapeCSVValue(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }
  
  const stringValue = String(value);
  
  // Check if the value contains special characters
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    // Escape quotes by doubling them and wrap in quotes
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  
  return stringValue;
}

/**
 * Converts array of objects to CSV string
 */
export function convertToCSV(options: CSVExportOptions): string {
  const { columns, data } = options;
  
  // Create header row
  const headers = columns.map(col => escapeCSVValue(col.label));
  const csvRows = [headers.join(',')];
  
  // Create data rows
  for (const row of data) {
    const values = columns.map(col => {
      const value = row[col.key];
      const formatted = col.format ? col.format(value) : value;
      return escapeCSVValue(formatted);
    });
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
}

/**
 * Triggers download of CSV file in browser
 */
export function downloadCSV(csvContent: string, filename: string = 'export.csv'): void {
  // Create blob with UTF-8 BOM for proper Excel compatibility
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // Create download link
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up
  URL.revokeObjectURL(url);
}

/**
 * All-in-one export function
 */
export function exportToCSV(options: CSVExportOptions): void {
  const csvContent = convertToCSV(options);
  const filename = options.filename || `export-${new Date().toISOString().split('T')[0]}.csv`;
  downloadCSV(csvContent, filename);
}
