/**
 * Export button component for downloading usage data as CSV.
 */

import { UsageItem } from '../types';
import { exportToCSV } from '../lib';
import { DownloadIcon } from './icons';

interface ExportButtonProps {
  data: UsageItem[];
  filename: string;
}

export function ExportButton({ data, filename }: ExportButtonProps) {
  return (
    <button 
      className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm font-medium text-surface-700 bg-surface-50 border border-surface-300 rounded-lg hover:bg-white hover:border-accent-300 hover:text-accent-600 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 transition-all duration-200 shadow-sm"
      onClick={() => exportToCSV(data, filename)}
      aria-label={`Export usage data to ${filename}`}
    >
      <DownloadIcon aria-hidden />
      <span>Export</span>
    </button>
  );
}

