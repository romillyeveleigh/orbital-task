/**
 * Bar chart component showing daily credit consumption.
 * Uses Recharts for responsive bar charts.
 * Fills in missing dates with 0 credits to show complete date range.
 */

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatInTimeZone } from 'date-fns-tz';
import { addDays } from 'date-fns';
import { UsageItem } from '../types';

interface CreditsChartProps {
  data: UsageItem[];
}

interface ChartDataPoint {
  date: string;
  credits: number;
}

/**
 * Format a Date object to DD-MM-YYYY display string in UTC.
 */
function formatDateDisplay(date: Date): string {
  return formatInTimeZone(date, 'UTC', 'dd-MM-yyyy');
}

/**
 * Format a Date object to YYYY-MM-DD sort key in UTC.
 */
function formatDateKey(date: Date): string {
  return formatInTimeZone(date, 'UTC', 'yyyy-MM-dd');
}

/**
 * Generate all dates between start and end (inclusive) in UTC.
 */
function generateDateRange(startDate: Date, endDate: Date): Date[] {
  const dates: Date[] = [];
  // Normalize to UTC midnight
  let current = new Date(Date.UTC(
    startDate.getUTCFullYear(),
    startDate.getUTCMonth(),
    startDate.getUTCDate()
  ));
  const end = new Date(Date.UTC(
    endDate.getUTCFullYear(),
    endDate.getUTCMonth(),
    endDate.getUTCDate()
  ));

  while (current <= end) {
    dates.push(new Date(current));
    current = addDays(current, 1);
  }
  return dates;
}

export function CreditsChart({ data }: CreditsChartProps) {
  console.log('data', data);
  // Group data by date and sum credits, filling in missing dates with 0
  const chartData = useMemo<ChartDataPoint[]>(() => {
    if (data.length === 0) return [];

    // First, group credits by date key
    const creditsByDate: Record<string, number> = {};
    let minDate: Date | null = null;
    let maxDate: Date | null = null;

    for (const item of data) {
      try {
        const date = new Date(item.timestamp);
        const dateKey = formatDateKey(date);
        
        creditsByDate[dateKey] = (creditsByDate[dateKey] || 0) + item.credits_used;

        // Track min/max dates
        if (!minDate || date < minDate) minDate = date;
        if (!maxDate || date > maxDate) maxDate = date;
      } catch {
        // Skip invalid timestamps
      }
    }

    if (!minDate || !maxDate) return [];

    // Generate all dates in range and fill in 0 for missing dates
    const allDates = generateDateRange(minDate, maxDate);
    
    return allDates.map((date) => {
      const dateKey = formatDateKey(date);
      return {
        date: formatDateDisplay(date),
        credits: creditsByDate[dateKey] || 0,
      };
    });
  }, [data]);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-500">No data to display</p>
      </div>
    );
  }

  return (
    <div className="w-full h-64 mb-8">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis
            label={{ value: 'Credits', angle: -90, position: 'insideLeft' }}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            formatter={(value: number) => [value.toFixed(2), 'Credits']}
            labelFormatter={(label) => `Date: ${label}`}
          />
          <Bar dataKey="credits" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

