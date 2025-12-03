/**
 * Tests for useSortState hook.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useSortState } from './useSortState';

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      {children}
    </MemoryRouter>
  );
}

describe('useSortState', () => {
  beforeEach(() => {
    // Reset URL before each test
    window.history.pushState({}, '', '/');
  });

  it('returns empty sort state initially', () => {
    const { result } = renderHook(() => useSortState(), { wrapper });
    
    expect(result.current.sortState).toEqual([]);
  });

  it('getSortDirection returns "none" for unsorted field', () => {
    const { result } = renderHook(() => useSortState(), { wrapper });
    
    expect(result.current.getSortDirection('credits_used')).toBe('none');
  });

  it('toggleSort cycles through none -> asc -> desc -> none', () => {
    const { result } = renderHook(() => useSortState(), { wrapper });
    
    // Initial state: none
    expect(result.current.getSortDirection('credits_used')).toBe('none');
    
    // First click: asc
    act(() => {
      result.current.toggleSort('credits_used');
    });
    expect(result.current.getSortDirection('credits_used')).toBe('asc');
    
    // Second click: desc
    act(() => {
      result.current.toggleSort('credits_used');
    });
    expect(result.current.getSortDirection('credits_used')).toBe('desc');
    
    // Third click: none
    act(() => {
      result.current.toggleSort('credits_used');
    });
    expect(result.current.getSortDirection('credits_used')).toBe('none');
  });

  it('supports multiple column sorting', () => {
    const { result } = renderHook(() => useSortState(), { wrapper });
    
    // Sort by credits_used ascending
    act(() => {
      result.current.toggleSort('credits_used');
    });
    
    // Also sort by report_name ascending
    act(() => {
      result.current.toggleSort('report_name');
    });
    
    expect(result.current.getSortDirection('credits_used')).toBe('asc');
    expect(result.current.getSortDirection('report_name')).toBe('asc');
    expect(result.current.sortState).toHaveLength(2);
  });

});

