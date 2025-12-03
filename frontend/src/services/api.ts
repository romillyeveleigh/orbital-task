/**
 * API service for fetching usage data from the backend.
 */

import { UsageResponse } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function fetchUsage(): Promise<UsageResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/usage`);

    if (!response.ok) {
      throw new Error(`Failed to fetch usage data: ${response.statusText}`);
    }

    const data: UsageResponse = await response.json();
    return data;
  } catch (error) {
    // Avoid leaking internal details in production
    if (import.meta.env.DEV) {
      console.error("Error fetching usage data:", error);
    }
    throw error;
  }
}
