/**
 * Bar chart component showing daily credit consumption.
 * Uses Recharts with custom styling and animations.
 * Fills in missing dates with 0 credits to show complete date range.
 */

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { formatInTimeZone } from 'date-fns-tz';
import { addDays } from 'date-fns';
import { UsageItem } from '../types';

interface CreditsChartProps {
  data: UsageItem[];
}

interface ChartDataPoint {
  date: string;
  credits: number;
  fullDate: string;
}

/**
 * Format a Date object to DD MMM display string in UTC.
 */
function formatDateDisplay(date: Date): string {
  return formatInTimeZone(date, 'UTC', 'dd MMM');
}

/**
 * Format a Date object to full date string for tooltip.
 */
function formatDateFull(date: Date): string {
  return formatInTimeZone(date, 'UTC', 'EEEE, dd MMMM yyyy');
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

/**
 * Custom tooltip component with premium styling.
 */
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const data = payload[0].payload;
  
  return (
    <div className="bg-surface-900/95 backdrop-blur-md border border-surface-800 rounded-lg shadow-xl p-3 animate-scale-in">
      <p className="text-slate-400 text-xs mb-1">{data.fullDate}</p>
      <p className="text-white font-semibold font-mono text-lg">
        {payload[0].value.toFixed(2)}
        <span className="text-slate-400 text-sm ml-1.5 font-sans font-normal">credits</span>
      </p>
    </div>
  );
}

export function CreditsChart({ data }: CreditsChartProps) {
  // Group data by date and sum credits, filling in missing dates with 0
  const chartData = useMemo<ChartDataPoint[]>(() => {
    if (data.length === 0) return [];

    const creditsByDate: Record<string, number> = {};
    let minDate: Date | null = null;
    let maxDate: Date | null = null;

    for (const item of data) {
      try {
        const date = new Date(item.timestamp);
        const dateKey = formatDateKey(date);
        
        creditsByDate[dateKey] = (creditsByDate[dateKey] || 0) + item.credits_used;

        if (!minDate || date < minDate) minDate = date;
        if (!maxDate || date > maxDate) maxDate = date;
      } catch {
        // Skip invalid timestamps
      }
    }

    if (!minDate || !maxDate) return [];

    const allDates = generateDateRange(minDate, maxDate);
    
    return allDates.map((date) => {
      const dateKey = formatDateKey(date);
      return {
        date: formatDateDisplay(date),
        fullDate: formatDateFull(date),
        credits: creditsByDate[dateKey] || 0,
      };
    });
  }, [data]);

  // Find max value for color intensity scaling
  const maxCredits = useMemo(() => {
    return Math.max(...chartData.map(d => d.credits), 1);
  }, [chartData]);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-surface-800/30 rounded-xl border border-surface-800/50">
        <p className="text-slate-500">No data to display</p>
      </div>
    );
  }

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={chartData} 
          margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
        >
          <defs>
            {/* Gradient for bars */}
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6376f1" stopOpacity={1} />
              <stop offset="100%" stopColor="#4244ca" stopOpacity={0.8} />
            </linearGradient>
            {/* Glow filter */}
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#334155" 
            strokeOpacity={0.3}
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            tickLine={false}
            axisLine={{ stroke: '#334155', strokeOpacity: 0.3 }}
            dy={8}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => value.toLocaleString()}
            width={50}
          />
          <Tooltip 
            content={<CustomTooltip />}
            cursor={{ fill: 'rgba(99, 118, 241, 0.1)', radius: 4 }}
          />
          <Bar 
            dataKey="credits" 
            radius={[6, 6, 0, 0]}
            animationDuration={800}
            animationEasing="ease-out"
          >
            {chartData.map((entry, index) => {
              // Calculate opacity based on value relative to max
              const intensity = 0.5 + (entry.credits / maxCredits) * 0.5;
              return (
                <Cell 
                  key={`cell-${index}`}
                  fill="url(#barGradient)"
                  fillOpacity={intensity}
                  style={{ filter: entry.credits > maxCredits * 0.7 ? 'url(#glow)' : 'none' }}
                />
              );
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
