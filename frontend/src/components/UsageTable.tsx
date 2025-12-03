/**
 * Table component for displaying usage data with sorting.
 */

import { useMemo } from 'react';
import { useReactTable, getCoreRowModel, getSortedRowModel, flexRender, ColumnDef } from '@tanstack/react-table';
import { UsageItem } from '../types';
import { useSortState } from '../hooks';
import { SortIcon } from './icons';
import { formatTimestamp, cn } from '../lib';

export function UsageTable({ data }: { data: UsageItem[] }) {
  const { sorting, setSorting } = useSortState();

  const columns = useMemo<ColumnDef<UsageItem>[]>(() => [
    {
      accessorKey: 'id',
      header: 'Message ID',
      enableSorting: false,
      cell: info => <span className="font-mono text-surface-500 text-sm">#{info.getValue() as number}</span>,
    },
    {
      accessorKey: 'timestamp',
      header: 'Timestamp',
      enableSorting: false,
      cell: info => <span className="text-surface-800">{formatTimestamp(info.getValue() as string)}</span>,
    },
    {
      accessorKey: 'report_name',
      header: 'Report Name',
      enableSorting: true,
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
      enableSorting: true,
      cell: info => (
        <span className="font-mono text-accent-700 font-medium">
          {(info.getValue() as number).toFixed(2)}
        </span>
      ),
    },
  ], []);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    isMultiSortEvent: () => true, // Always enable multi-sort
    enableSortingRemoval: true,
  });


  const sortedRows = table.getRowModel().rows;
  const activeSorts = table.getState().sorting;

  return (
    <div className="overflow-x-auto rounded-xl">
      <table className="min-w-full">
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id} className="border-b border-surface-200">
              {headerGroup.headers.map(header => {
                const canSort = header.column.getCanSort();
                const isSorted = header.column.getIsSorted();
                const sortIndex = header.column.getSortIndex();
                const sortDirection = isSorted || 'none';
                const toggleHandler = header.column.getToggleSortingHandler();
                
                return (
                  <th
                    key={header.id}
                    className={cn(
                      'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider transition-colors',
                      canSort && 'cursor-pointer hover:bg-surface-100 select-none',
                      isSorted ? 'text-accent-700' : 'text-surface-600'
                    )}
                    onClick={toggleHandler}
                  >
                    <div className="flex items-center gap-2">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {canSort && (
                        <div className="flex items-center gap-1">
                          {sortIndex >= 0 && activeSorts.length > 1 && (
                            <span className="text-xs text-accent-600 font-medium">{sortIndex + 1}</span>
                          )}
                          <SortIcon direction={sortDirection} />
                        </div>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-surface-200">
          {sortedRows.map((row, i) => (
            <tr key={row.id} className="table-row-animate" style={{ animationDelay: `${i * 20}ms` }}>
              {row.getVisibleCells().map(cell => (
                <td key={cell.id} className="px-4 py-4 text-sm">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={columns.length} className="px-4 py-3 border-t border-surface-200 bg-surface-50">
              <p className="text-xs text-surface-600">
                Showing <span className="text-surface-800 font-medium">{sortedRows.length}</span> entries
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
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
