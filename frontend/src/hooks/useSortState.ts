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

  // Update sort state in URL
  const updateSort = useCallback((field: string, currentDirection: SortDirection) => {
    const newSortState = [...sortState];
    const existingIndex = newSortState.findIndex((s) => s.field === field);

    // Determine next direction: none -> asc -> desc -> none (3-click cycle)
    let nextDirection: SortDirection;
    if (currentDirection === 'none') {
      nextDirection = 'asc';
    } else if (currentDirection === 'asc') {
      nextDirection = 'desc';
    } else {
      nextDirection = 'none';
    }

    if (existingIndex >= 0) {
      if (nextDirection === 'none') {
        // Remove sort if going back to none
        newSortState.splice(existingIndex, 1);
      } else {
        // Update existing sort
        newSortState[existingIndex] = { field, direction: nextDirection };
      }
    } else {
      // Add new sort
      newSortState.push({ field, direction: nextDirection });
    }

    // Update URL
    const newParams = new URLSearchParams(searchParams);
    if (newSortState.length === 0) {
      newParams.delete('sort');
    } else {
      newParams.set(
        'sort',
        newSortState.map((s) => `${s.field}:${s.direction}`).join(',')
      );
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
    updateSort,
    getSortDirection,
  };
}

