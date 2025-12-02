/**
 * Table component for displaying usage data with sorting.
 * Uses TanStack Table for robust multi-column sorting.
 */

import { useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
  SortingState,
} from '@tanstack/react-table';
import { format } from 'date-fns';
import { UsageItem } from '../types';
import { useSortState } from '../hooks/useSortState';

// Columns that support sorting
const SORTABLE_COLUMNS = ['report_name', 'credits_used'];

interface UsageTableProps {
  data: UsageItem[];
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
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: 'timestamp',
        header: 'Timestamp',
        cell: (info) => {
          const timestamp = info.getValue() as string;
          try {
            return format(new Date(timestamp), 'dd-MM-yyyy HH:mm');
          } catch {
            return timestamp;
          }
        },
      },
      {
        accessorKey: 'report_name',
        header: 'Report Name',
        enableSorting: true,
        cell: (info) => {
          const value = info.getValue() as string | undefined;
          return value || '';
        },
      },
      {
        accessorKey: 'credits_used',
        header: 'Credits Used',
        enableSorting: true,
        cell: (info) => {
          const value = info.getValue() as number;
          return value.toFixed(2);
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

        if (aValue < bValue) {
          return sort.desc ? 1 : -1;
        }
        if (aValue > bValue) {
          return sort.desc ? -1 : 1;
        }
      }
      return 0;
    });
  }, [data, sortingState]);

  const table = useReactTable({
    data: sortedData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true, // We handle sorting manually via URL state
  });

  // Handle column header click
  const handleSort = (columnId: string) => {
    const currentDirection = getSortDirection(columnId);
    updateSort(columnId, currentDirection);
  };

  // Get sort icon for a column
  const getSortIcon = (columnId: string) => {
    const direction = getSortDirection(columnId);
    if (direction === 'asc') {
      return '↑';
    } else if (direction === 'desc') {
      return '↓';
    }
    return '↕';
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
        <thead className="bg-gray-50">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const isSortable = SORTABLE_COLUMNS.includes(header.column.id);
                return (
                  <th
                    key={header.id}
                    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                      isSortable
                        ? 'cursor-pointer hover:bg-gray-100 select-none'
                        : ''
                    }`}
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
                        <span className="text-gray-400" aria-hidden="true">
                          {getSortIcon(header.column.id)}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="hover:bg-gray-50">
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

