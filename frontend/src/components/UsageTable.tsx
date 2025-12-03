/**
 * Table component for displaying usage data with sorting.
 */

import { useMemo } from 'react';
import { useReactTable, getCoreRowModel, flexRender, ColumnDef } from '@tanstack/react-table';
import { formatInTimeZone } from 'date-fns-tz';
import { UsageItem } from '../types';
import { useSortState } from '../hooks';
import { SortIcon } from './icons';

const SORTABLE_COLUMNS = ['report_name', 'credits_used'];

/**
 * Formats ISO 8601 timestamp to "DD-MM-YYYY HH:mm" format in UTC.
 * Using UTC ensures consistent billing data display across all users regardless of timezone,
 * which is standard practice for usage/billing dashboards.
 */
function formatTimestamp(isoTimestamp: string): string {
  try {
    const date = new Date(isoTimestamp);
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    return formatInTimeZone(date, 'UTC', 'dd-MM-yyyy HH:mm');
  } catch {
    return 'Invalid date';
  }
}

export function UsageTable({ data }: { data: UsageItem[] }) {
  const { sortState, toggleSort, getSortDirection } = useSortState();

  const activeSorts = useMemo(() => 
    sortState
      .filter(s => s.direction !== 'none')
      .map(s => ({ id: s.field, desc: s.direction === 'desc' })),
    [sortState]
  );

  const columns = useMemo<ColumnDef<UsageItem>[]>(() => [
    {
      accessorKey: 'id',
      header: 'Message ID',
      cell: info => <span className="font-mono text-surface-500 text-sm">#{info.getValue() as number}</span>,
    },
    {
      accessorKey: 'timestamp',
      header: 'Timestamp',
      cell: info => <span className="text-surface-800">{formatTimestamp(info.getValue() as string)}</span>,
    },
    {
      accessorKey: 'report_name',
      header: 'Report Name',
      cell: info => {
        const value = info.getValue() as string | undefined;
        if (!value) return <span className="text-surface-400 italic">—</span>;
        return (
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent-500" />
            <span className="text-surface-800">{value}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'credits_used',
      header: 'Credits Used',
      cell: info => (
        <span className="font-mono text-accent-700 font-medium">
          {(info.getValue() as number).toFixed(2)}
        </span>
      ),
    },
  ], []);

  const sortedData = useMemo(() => {
    if (activeSorts.length === 0) return data;

    return [...data].sort((a, b) => {
      for (const sort of activeSorts) {
        const aVal = sort.id === 'report_name' ? (a.report_name || '') : a.credits_used;
        const bVal = sort.id === 'report_name' ? (b.report_name || '') : b.credits_used;
        if (aVal < bVal) return sort.desc ? 1 : -1;
        if (aVal > bVal) return sort.desc ? -1 : 1;
      }
      return 0;
    });
  }, [data, activeSorts]);

  const table = useReactTable({
    data: sortedData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
  });


  return (
    <div className="overflow-x-auto rounded-xl">
      <table className="min-w-full">
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id} className="border-b border-surface-200">
              {headerGroup.headers.map(header => {
                const isSortable = SORTABLE_COLUMNS.includes(header.column.id);
                const direction = getSortDirection(header.column.id);
                
                return (
                  <th
                    key={header.id}
                    className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider transition-colors ${
                      isSortable ? 'cursor-pointer hover:bg-surface-100 select-none' : ''
                    } ${direction !== 'none' ? 'text-accent-700' : 'text-surface-600'}`}
                    onClick={() => isSortable && toggleSort(header.column.id)}
                  >
                    <div className="flex items-center gap-2">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {isSortable && <SortIcon direction={direction} />}
                    </div>
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-surface-200">
          {table.getRowModel().rows.map((row, i) => (
            <tr key={row.id} className="table-row-animate" style={{ animationDelay: `${i * 20}ms` }}>
              {row.getVisibleCells().map(cell => (
                <td key={cell.id} className="px-4 py-4 text-sm">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      
      <div className="px-4 py-3 border-t border-surface-200 bg-surface-50">
        <p className="text-xs text-surface-600">
          Showing <span className="text-surface-800 font-medium">{sortedData.length}</span> entries
          {activeSorts.length > 0 && (
            <span className="ml-2">
              • Sorted by{' '}
              {activeSorts.map((s, i) => (
                <span key={s.id}>
                  {i > 0 && ', '}
                  <span className="text-accent-700">{s.id.replace('_', ' ')}</span>
                  <span className="text-surface-600"> ({s.desc ? 'desc' : 'asc'})</span>
                </span>
              ))}
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
