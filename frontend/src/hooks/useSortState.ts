/**
 * Custom hook for managing sort state in URL query parameters.
 * Enables shareable links with sort state preserved.
 */

import { useSearchParams } from 'react-router-dom';
import { useMemo, useCallback } from 'react';
import { SortState, SortDirection } from '../types';

export function useSortState() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Parse sort state from URL
  const sortState = useMemo(() => {
    const sortParam = searchParams.get('sort');
    if (!sortParam) {
      return [];
    }

    return sortParam.split(',').map((item) => {
      const [field, direction] = item.split(':');
      return {
        field,
        direction: direction as SortDirection,
      };
    }).filter((s): s is SortState => s.field !== undefined && s.direction !== undefined);
  }, [searchParams]);

  // Toggle sort state for a field (none -> asc -> desc -> none)
  const toggleSort = useCallback((field: string) => {
    const newSortState = [...sortState];
    const existingIndex = newSortState.findIndex((s) => s.field === field);
    const currentDirection = existingIndex >= 0 
      ? newSortState[existingIndex].direction 
      : 'none';

    const nextDirection: SortDirection =
      currentDirection === 'none' ? 'asc' :
      currentDirection === 'asc' ? 'desc' : 'none';

    if (existingIndex >= 0) {
      if (nextDirection === 'none') {
        newSortState.splice(existingIndex, 1);
      } else {
        newSortState[existingIndex] = { field, direction: nextDirection };
      }
    } else {
      newSortState.push({ field, direction: nextDirection });
    }

    // Update URL
    const newParams = new URLSearchParams(searchParams);
    if (newSortState.length === 0) {
      newParams.delete('sort');
    } else {
      newParams.set('sort', newSortState.map((s) => `${s.field}:${s.direction}`).join(','));
    }
    setSearchParams(newParams, { replace: true });
  }, [sortState, searchParams, setSearchParams]);

  // Get current sort direction for a field
  const getSortDirection = useCallback((field: string): SortDirection => {
    const sort = sortState.find((s) => s.field === field);
    return sort?.direction || 'none';
  }, [sortState]);

  return {
    sortState,
    toggleSort,
    getSortDirection,
  };
}

