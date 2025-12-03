/**
 * Tests for useSortState hook.
 */

import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { useSortState } from "./useSortState";

function createWrapper(initialEntries: string[] = ["/"]) {
  return ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter
      initialEntries={initialEntries}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      {children}
    </MemoryRouter>
  );
}

describe("useSortState", () => {
  it("returns empty sort state initially", () => {
    const { result } = renderHook(() => useSortState(), {
      wrapper: createWrapper(),
    });

    expect(result.current.sorting).toEqual([]);
  });

  it("converts URL params to TanStack SortingState format", () => {
    const { result } = renderHook(() => useSortState(), {
      wrapper: createWrapper(["/?sort=credits_used:asc"]),
    });

    expect(result.current.sorting).toEqual([
      { id: "credits_used", desc: false },
    ]);
  });

  it("handles descending sort in URL", () => {
    const { result } = renderHook(() => useSortState(), {
      wrapper: createWrapper(["/?sort=credits_used:desc"]),
    });

    expect(result.current.sorting).toEqual([
      { id: "credits_used", desc: true },
    ]);
  });

  it("supports multiple column sorting in URL", () => {
    const { result } = renderHook(() => useSortState(), {
      wrapper: createWrapper(["/?sort=credits_used:asc,report_name:desc"]),
    });

    expect(result.current.sorting).toEqual([
      { id: "credits_used", desc: false },
      { id: "report_name", desc: true },
    ]);
  });

  it("setSorting updates URL params", () => {
    const { result } = renderHook(() => useSortState(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.setSorting([{ id: "credits_used", desc: false }]);
    });

    expect(result.current.sorting).toEqual([
      { id: "credits_used", desc: false },
    ]);
  });

  it("setSorting with empty array removes sort param", () => {
    const { result } = renderHook(() => useSortState(), {
      wrapper: createWrapper(["/?sort=credits_used:asc"]),
    });

    act(() => {
      result.current.setSorting([]);
    });

    expect(result.current.sorting).toEqual([]);
  });

  it("setSorting with function updater works", () => {
    const { result } = renderHook(() => useSortState(), {
      wrapper: createWrapper(["/?sort=credits_used:asc"]),
    });

    act(() => {
      result.current.setSorting((prev) => [
        ...prev,
        { id: "report_name", desc: true },
      ]);
    });

    expect(result.current.sorting).toEqual([
      { id: "credits_used", desc: false },
      { id: "report_name", desc: true },
    ]);
  });
});
