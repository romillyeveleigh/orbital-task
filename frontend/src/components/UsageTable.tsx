/**
 * Table component for displaying usage data with sorting.
 * Features premium dark theme styling with smooth animations.
 */

import { useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
  SortingState,
} from '@tanstack/react-table';
import { formatInTimeZone } from 'date-fns-tz';
import { UsageItem } from '../types';
import { useSortState } from '../hooks/useSortState';

/**
 * Format an ISO 8601 timestamp to a readable format in UTC.
 */
function formatTimestampUTC(isoTimestamp: string): { date: string; time: string } {
  try {
    const d = new Date(isoTimestamp);
    return {
      date: formatInTimeZone(d, 'UTC', 'dd MMM yyyy'),
      time: formatInTimeZone(d, 'UTC', 'HH:mm'),
    };
  } catch {
    return { date: isoTimestamp, time: '' };
  }
}

// Columns that support sorting
const SORTABLE_COLUMNS = ['report_name', 'credits_used'];

interface UsageTableProps {
  data: UsageItem[];
}

// Sort indicator component
function SortIndicator({ direction }: { direction: 'asc' | 'desc' | 'none' }) {
  if (direction === 'none') {
    return (
      <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
      </svg>
    );
  }
  
  return (
    <svg 
      className={`w-4 h-4 text-orbital-400 transition-transform duration-200 ${direction === 'desc' ? 'rotate-180' : ''}`} 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
    </svg>
  );
}

export function UsageTable({ data }: UsageTableProps) {
  const { sortState, updateSort, getSortDirection } = useSortState();

  // Convert sort state to TanStack Table format
  const sortingState: SortingState = useMemo(() => {
    return sortState
      .filter((s) => s.direction !== 'none')
      .map((s) => ({
        id: s.field,
        desc: s.direction === 'desc',
      }));
  }, [sortState]);

  // Define columns
  const columns = useMemo<ColumnDef<UsageItem>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'Message ID',
        cell: (info) => (
          <span className="font-mono text-slate-400 text-sm">#{info.getValue() as number}</span>
        ),
      },
      {
        accessorKey: 'timestamp',
        header: 'Timestamp',
        cell: (info) => {
          const { date, time } = formatTimestampUTC(info.getValue() as string);
          return (
            <div className="flex flex-col">
              <span className="text-slate-200">{date}</span>
              <span className="text-slate-500 text-xs">{time} UTC</span>
            </div>
          );
        },
      },
      {
        accessorKey: 'report_name',
        header: 'Report Name',
        enableSorting: true,
        cell: (info) => {
          const value = info.getValue() as string | undefined;
          if (!value) {
            return <span className="text-slate-600 italic">—</span>;
          }
          return (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orbital-500 flex-shrink-0"></span>
              <span className="text-slate-200">{value}</span>
            </div>
          );
        },
      },
      {
        accessorKey: 'credits_used',
        header: 'Credits Used',
        enableSorting: true,
        cell: (info) => {
          const value = info.getValue() as number;
          return (
            <span className="font-mono text-orbital-300 font-medium">
              {value.toFixed(2)}
            </span>
          );
        },
      },
    ],
    []
  );

  // Apply sorting to data based on URL state
  const sortedData = useMemo(() => {
    if (sortingState.length === 0) {
      return data;
    }

    return [...data].sort((a, b) => {
      for (const sort of sortingState) {
        const field = sort.id;
        let aValue: any;
        let bValue: any;

        if (field === 'report_name') {
          aValue = a.report_name || '';
          bValue = b.report_name || '';
        } else if (field === 'credits_used') {
          aValue = a.credits_used;
          bValue = b.credits_used;
        } else {
          continue;
        }

        if (aValue < bValue) return sort.desc ? 1 : -1;
        if (aValue > bValue) return sort.desc ? -1 : 1;
      }
      return 0;
    });
  }, [data, sortingState]);

  const table = useReactTable({
    data: sortedData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
  });

  // Handle column header click
  const handleSort = (columnId: string) => {
    const currentDirection = getSortDirection(columnId);
    updateSort(columnId, currentDirection);
  };

  return (
    <div className="overflow-x-auto rounded-xl">
      <table className="min-w-full">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="border-b border-surface-800">
              {headerGroup.headers.map((header) => {
                const isSortable = SORTABLE_COLUMNS.includes(header.column.id);
                const direction = getSortDirection(header.column.id);
                const isActive = direction !== 'none';
                
                return (
                  <th
                    key={header.id}
                    className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider transition-colors duration-200 ${
                      isSortable
                        ? 'cursor-pointer hover:bg-surface-800/50 select-none'
                        : ''
                    } ${isActive ? 'text-orbital-400' : 'text-slate-500'}`}
                    onClick={() => isSortable && handleSort(header.column.id)}
                    aria-label={
                      isSortable
                        ? `Sort by ${header.column.id}`
                        : undefined
                    }
                  >
                    <div className="flex items-center gap-2">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {isSortable && (
                        <SortIndicator direction={direction} />
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-surface-800/50">
          {table.getRowModel().rows.map((row, index) => (
            <tr 
              key={row.id} 
              className="table-row-animate group"
              style={{ animationDelay: `${index * 20}ms` }}
            >
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className="px-4 py-4 text-sm"
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Table footer with row count */}
      <div className="px-4 py-3 border-t border-surface-800 bg-surface-900/30">
        <p className="text-xs text-slate-500">
          Showing <span className="text-slate-400 font-medium">{sortedData.length}</span> entries
          {sortingState.length > 0 && (
            <span className="ml-2">
              • Sorted by{' '}
              {sortingState.map((s, i) => (
                <span key={s.id}>
                  {i > 0 && ', '}
                  <span className="text-orbital-400">{s.id.replace('_', ' ')}</span>
                  <span className="text-slate-600"> ({s.desc ? 'desc' : 'asc'})</span>
                </span>
              ))}
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
