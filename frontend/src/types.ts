/**
 * Type definitions for the Orbital Copilot usage dashboard.
 */

export interface UsageItem {
  id: number;
  timestamp: string;
  report_name?: string; // Optional - may be omitted when not present
  credits_used: number;
}

export interface UsageResponse {
  usage: UsageItem[];
}

export type SortDirection = 'asc' | 'desc' | 'none';

export interface SortState {
  field: string;
  direction: SortDirection;
}

