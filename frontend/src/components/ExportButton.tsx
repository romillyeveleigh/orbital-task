/**
 * Export button component for downloading usage data as CSV.
 */

import { UsageItem } from '../types';
import { exportToCSV } from '../utils/csv';

interface ExportButtonProps {
  data: UsageItem[];
  filename: string;
}

export function ExportButton({ data, filename }: ExportButtonProps) {
  return (
    <button 
      className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm font-medium text-surface-700 bg-surface-50 border border-surface-300 rounded-lg hover:bg-white hover:border-accent-300 hover:text-accent-600 transition-all duration-200 shadow-sm"
      onClick={() => exportToCSV(data, filename)}
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      Export
    </button>
  );
}

