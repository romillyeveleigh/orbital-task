/**
 * Custom hook for managing sort state in URL query parameters with TanStack Table.
 * Enables shareable links with sort state preserved.
 * Converts between URL format and TanStack Table's SortingState format.
 */

import { useSearchParams } from "react-router-dom";
import { useMemo, useCallback } from "react";
import { SortingState } from "@tanstack/react-table";

/**
 * Converts URL sort param format (field:direction,field:direction) to TanStack SortingState
 */
function urlToSortingState(sortParam: string | null): SortingState {
  if (!sortParam) {
    return [];
  }

  return sortParam
    .split(",")
    .map((item) => {
      const [id, direction] = item.split(":");
      return {
        id,
        desc: direction === "desc",
      };
    })
    .filter((s): s is { id: string; desc: boolean } => s.id !== undefined);
}

/**
 * Converts TanStack SortingState to URL sort param format
 */
function sortingStateToUrl(sorting: SortingState): string {
  return sorting.map((s) => `${s.id}:${s.desc ? "desc" : "asc"}`).join(",");
}

export function useSortState() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Parse sort state from URL in TanStack format
  const sorting = useMemo<SortingState>(() => {
    const sortParam = searchParams.get("sort");
    return urlToSortingState(sortParam);
  }, [searchParams]);

  // Update URL when sorting state changes
  const setSorting = useCallback(
    (updater: SortingState | ((prev: SortingState) => SortingState)) => {
      const newSorting =
        typeof updater === "function" ? updater(sorting) : updater;

      const newParams = new URLSearchParams(searchParams);
      if (newSorting.length === 0) {
        newParams.delete("sort");
      } else {
        newParams.set("sort", sortingStateToUrl(newSorting));
      }
      setSearchParams(newParams, { replace: true });
    },
    [sorting, searchParams, setSearchParams]
  );

  return {
    sorting,
    setSorting,
  };
}
