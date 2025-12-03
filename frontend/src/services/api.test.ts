/**
 * Tests for API service.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchUsage } from './api';

describe('fetchUsage', () => {
  const mockResponse = {
    usage: [
      {
        id: 1000,
        timestamp: '2024-04-29T02:08:29.375Z',
        report_name: 'Test Report',
        credits_used: 79.00,
      },
    ],
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches usage data successfully', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const result = await fetchUsage();

    expect(result).toEqual(mockResponse);
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/usage'));
  });

  it('throws error on failed request', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      statusText: 'Internal Server Error',
    });

    await expect(fetchUsage()).rejects.toThrow('Failed to fetch usage data');
  });

  it('throws error on network failure', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    await expect(fetchUsage()).rejects.toThrow('Network error');
  });
});

