/**
 * CSV export utility for usage data.
 */

import { UsageItem } from '../types';

/**
 * Export usage data to CSV and trigger download.
 */
export function exportToCSV(data: UsageItem[], filename: string): void {
  const headers = ['Message ID', 'Timestamp', 'Report Name', 'Credits Used'];
  
  const rows = data.map(item => [
    item.id,
    item.timestamp,
    item.report_name || '',
    item.credits_used.toFixed(2)
  ]);
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

