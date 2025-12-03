/**
 * Bar chart component showing daily credit consumption.
 * Light theme styling for client-facing use.
 */

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatInTimeZone } from 'date-fns-tz';
import { addDays } from 'date-fns';
import { UsageItem } from '../types';

interface CreditsChartProps {
  data: UsageItem[];
}

interface ChartDataPoint {
  date: string;
  chatCredits: number;
  reportCredits: number;
  totalCredits: number;
  fullDate: string;
}

function formatDateDisplay(date: Date): string {
  return formatInTimeZone(date, 'UTC', 'dd MMM');
}

function formatDateFull(date: Date): string {
  return formatInTimeZone(date, 'UTC', 'EEEE, dd MMMM yyyy');
}

function formatDateKey(date: Date): string {
  return formatInTimeZone(date, 'UTC', 'yyyy-MM-dd');
}

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

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
    dataKey: string;
    payload: ChartDataPoint;
    color: string;
  }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  const chatPayload = payload.find(p => p.dataKey === 'chatCredits');
  const reportPayload = payload.find(p => p.dataKey === 'reportCredits');
  
  return (
    <div className="bg-white border border-surface-200 rounded-lg shadow-lg p-3 animate-scale-in">
      <p className="text-surface-600 text-xs mb-2">{data.fullDate}</p>
      <div className="space-y-1">
        {chatPayload && (
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#93c5fd' }} />
              <span className="text-surface-600 text-xs">Chat</span>
            </div>
            <span className="text-surface-900 font-semibold font-mono text-sm">
              {chatPayload.value.toFixed(2)}
            </span>
          </div>
        )}
        {reportPayload && (
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#3b82f6' }} />
              <span className="text-surface-600 text-xs">Report Generation</span>
            </div>
            <span className="text-surface-900 font-semibold font-mono text-sm">
              {reportPayload.value.toFixed(2)}
            </span>
          </div>
        )}
        <div className="pt-1 mt-1 border-t border-surface-200">
          <div className="flex items-center justify-between gap-4">
            <span className="text-surface-700 text-xs font-medium">Total</span>
            <span className="text-surface-900 font-semibold font-mono text-base">
              {data.totalCredits.toFixed(2)}
              <span className="text-surface-600 text-xs ml-1.5 font-sans font-normal">credits</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CreditsChart({ data }: CreditsChartProps) {
  const chartData = useMemo<ChartDataPoint[]>(() => {
    if (data.length === 0) return [];

    const chatCreditsByDate: Record<string, number> = {};
    const reportCreditsByDate: Record<string, number> = {};
    let minDate: Date | null = null;
    let maxDate: Date | null = null;

    for (const item of data) {
      try {
        const date = new Date(item.timestamp);
        const dateKey = formatDateKey(date);
        
        if (item.report_name) {
          // Report generation
          reportCreditsByDate[dateKey] = (reportCreditsByDate[dateKey] || 0) + item.credits_used;
        } else {
          // Chat
          chatCreditsByDate[dateKey] = (chatCreditsByDate[dateKey] || 0) + item.credits_used;
        }
        
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
      const chatCredits = chatCreditsByDate[dateKey] || 0;
      const reportCredits = reportCreditsByDate[dateKey] || 0;
      return {
        date: formatDateDisplay(date),
        fullDate: formatDateFull(date),
        chatCredits,
        reportCredits,
        totalCredits: chatCredits + reportCredits,
      };
    });
  }, [data]);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-surface-100 rounded-xl border border-surface-200" role="status" aria-live="polite">
        <p className="text-surface-600">No data to display</p>
      </div>
    );
  }

  return (
    <div className="w-full h-72" role="img" aria-label="Bar chart showing daily credits consumption">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }} aria-label="Daily credits consumption chart">
          <defs>
            <linearGradient id="chatGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#93c5fd" stopOpacity={1} />
              <stop offset="100%" stopColor="#60a5fa" stopOpacity={0.8} />
            </linearGradient>
            <linearGradient id="reportGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
              <stop offset="100%" stopColor="#2563eb" stopOpacity={0.8} />
            </linearGradient>
          </defs>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#e2e8f0" 
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: '#64748b' }}
            tickLine={false}
            axisLine={{ stroke: '#e2e8f0' }}
            dy={8}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#64748b' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => value.toLocaleString()}
            width={50}
          />
          <Tooltip 
            content={<CustomTooltip />}
            cursor={{ fill: 'rgba(59, 130, 246, 0.08)', radius: 4 }}
          />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="circle"
            formatter={(value) => (
              <span className="text-surface-700 text-xs">{value}</span>
            )}
          />
          <Bar 
            dataKey="reportCredits" 
            name="Report Generation"
            stackId="credits"
            fill="url(#reportGradient)"
            radius={[0, 0, 0, 0]}
            animationDuration={800}
            animationEasing="ease-out"
          />
          <Bar 
            dataKey="chatCredits" 
            name="Chat"
            stackId="credits"
            fill="url(#chatGradient)"
            radius={[6, 6, 0, 0]}
            animationDuration={800}
            animationEasing="ease-out"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
