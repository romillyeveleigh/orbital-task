/**
 * TanStack Query hook for fetching usage data.
 * Provides automatic caching, error handling, and loading states.
 */

import { useQuery } from '@tanstack/react-query';
import { fetchUsage } from '../services/api';
import { UsageResponse } from '../types';

export function useUsageData() {
  const { data, isLoading, error } = useQuery<UsageResponse>({
    queryKey: ['usage'],
    queryFn: fetchUsage,
    staleTime: 30000, // Consider data fresh for 30 seconds
    retry: 2,
  });

  return {
    data: data?.usage || [],
    isLoading,
    error,
  };
}

