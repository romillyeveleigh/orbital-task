/**
 * Bar chart component showing daily credit consumption.
 * Uses Recharts for responsive bar charts.
 */

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';
import { UsageItem } from '../types';

interface CreditsChartProps {
  data: UsageItem[];
}

interface ChartDataPoint {
  date: string;
  credits: number;
}

export function CreditsChart({ data }: CreditsChartProps) {
  // Group data by date and sum credits
  const chartData = useMemo<ChartDataPoint[]>(() => {
    const grouped = data.reduce((acc, item) => {
      try {
        const dateKey = format(parseISO(item.timestamp), 'yyyy-MM-dd');
        const displayDate = format(parseISO(item.timestamp), 'dd-MM-yyyy');
        
        if (!acc[dateKey]) {
          acc[dateKey] = { date: displayDate, credits: 0, sortKey: dateKey };
        }
        acc[dateKey].credits += item.credits_used;
        return acc;
      } catch {
        return acc;
      }
    }, {} as Record<string, ChartDataPoint & { sortKey: string }>);

    // Convert to array and sort by date (using sortKey)
    return Object.values(grouped)
      .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
      .map(({ sortKey, ...rest }) => rest);
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

