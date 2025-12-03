/**
 * GitHub contributions-style heatmap component for displaying daily usage.
 * Shows a grid of squares representing daily credit usage.
 */

import { useMemo, useState } from "react";
import { formatInTimeZone } from "date-fns-tz";
import { UsageItem } from "../types";
import { cn } from "../lib";

interface DayData {
  date: Date;
  credits: number;
  count: number;
}

interface UsageHeatmapProps {
  data: UsageItem[];
}

export function UsageHeatmap({ data }: UsageHeatmapProps) {
  const [hoveredDay, setHoveredDay] = useState<{
    weekIndex: number;
    dayIndex: number;
  } | null>(null);

  // Group data by day and calculate totals
  const dayData = useMemo(() => {
    const grouped = new Map<string, DayData>();

    data.forEach((item) => {
      const date = new Date(item.timestamp);
      // Use UTC date string as key (YYYY-MM-DD)
      const dateKey = formatInTimeZone(date, "UTC", "yyyy-MM-dd");
      const existing = grouped.get(dateKey);

      if (existing) {
        existing.credits += item.credits_used;
        existing.count += 1;
      } else {
        grouped.set(dateKey, {
          date,
          credits: item.credits_used,
          count: 1,
        });
      }
    });

    return Array.from(grouped.values()).sort(
      (a, b) => a.date.getTime() - b.date.getTime()
    );
  }, [data]);

  // Calculate max credits for color intensity
  const maxCredits = useMemo(() => {
    if (dayData.length === 0) return 1;
    return Math.max(...dayData.map((d) => d.credits));
  }, [dayData]);

  // Show all days in months that have activity
  const gridDays = useMemo(() => {
    if (dayData.length === 0) return [];

    // Find all unique months with activity (YYYY-MM format)
    const activeMonths = new Set<string>();
    dayData.forEach((d) => {
      const monthKey = formatInTimeZone(d.date, "UTC", "yyyy-MM");
      activeMonths.add(monthKey);
    });

    // Create a map of date keys to day data
    const dataMap = new Map(
      dayData.map((d) => {
        const key = formatInTimeZone(d.date, "UTC", "yyyy-MM-dd");
        return [key, d];
      })
    );

    // Generate all days for each active month
    const allDays: Array<{ date: Date; data?: DayData }> = [];

    // Sort months chronologically
    const sortedMonths = Array.from(activeMonths).sort();

    sortedMonths.forEach((monthKey) => {
      const [year, month] = monthKey.split("-").map(Number);

      // Get first and last day of the month
      const firstDay = new Date(Date.UTC(year, month - 1, 1));
      const lastDay = new Date(Date.UTC(year, month, 0)); // Last day of month

      // Generate all days in this month
      for (let day = 1; day <= lastDay.getUTCDate(); day++) {
        const date = new Date(Date.UTC(year, month - 1, day));
        date.setUTCHours(0, 0, 0, 0);

        const dateKey = formatInTimeZone(date, "UTC", "yyyy-MM-dd");
        const data = dataMap.get(dateKey);

        allDays.push({ date, data });
      }
    });

    return allDays;
  }, [dayData]);

  // Get color intensity based on credits (0-4 levels)
  const getIntensity = (credits: number): number => {
    if (credits === 0) return 0;
    if (maxCredits === 0) return 0;
    const ratio = credits / maxCredits;
    if (ratio < 0.25) return 1;
    if (ratio < 0.5) return 2;
    if (ratio < 0.75) return 3;
    return 4;
  };

  // Format date for display
  const formatDate = (date: Date): string => {
    return formatInTimeZone(date, "UTC", "MMM dd, yyyy");
  };

  // Get day of week (0 = Sunday, 6 = Saturday)
  const getDayOfWeek = (date: Date): number => {
    return date.getUTCDay();
  };

  // Organize days into weeks (Sunday to Saturday)
  // Pad weeks to start on Sunday and end on Saturday
  const weeks = useMemo(() => {
    if (gridDays.length === 0) return [];

    const weeksArray: Array<Array<{ date: Date; data?: DayData }>> = [];
    let currentWeek: Array<{ date: Date; data?: DayData }> = [];

    // Pad first week if it doesn't start on Sunday
    const firstDay = gridDays[0];
    const firstDayOfWeek = getDayOfWeek(firstDay.date);
    if (firstDayOfWeek > 0) {
      for (let i = 0; i < firstDayOfWeek; i++) {
        const date = new Date(firstDay.date);
        date.setUTCDate(date.getUTCDate() - (firstDayOfWeek - i));
        date.setUTCHours(0, 0, 0, 0);
        currentWeek.push({ date });
      }
    }

    gridDays.forEach((day) => {
      const dayOfWeek = getDayOfWeek(day.date);

      // Start new week on Sunday
      if (dayOfWeek === 0 && currentWeek.length > 0) {
        weeksArray.push(currentWeek);
        currentWeek = [];
      }

      currentWeek.push(day);
    });

    // Pad last week if it doesn't end on Saturday
    if (currentWeek.length > 0) {
      const lastDay = gridDays[gridDays.length - 1];
      const lastDayOfWeek = getDayOfWeek(lastDay.date);
      if (lastDayOfWeek < 6) {
        for (let i = lastDayOfWeek + 1; i <= 6; i++) {
          const date = new Date(lastDay.date);
          date.setUTCDate(date.getUTCDate() + (i - lastDayOfWeek));
          date.setUTCHours(0, 0, 0, 0);
          currentWeek.push({ date });
        }
      }
      weeksArray.push(currentWeek);
    }

    return weeksArray;
  }, [gridDays]);

  if (dayData.length === 0) {
    return (
      <div className="text-center py-8 text-surface-500">
        <p>No usage data available for heatmap</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto pt-16 -mt-16 pb-2">
        <div className="inline-block">
          <div className="flex gap-1">
            {/* Day labels */}
            <div className="flex flex-col gap-1 pr-2">
              <div className="h-3" /> {/* Spacer for month labels */}
              {["", "Mon", "", "Wed", "", "Fri", ""].map((label, i) => (
                <div
                  key={i}
                  className="h-3 min-w-[32px] text-xs text-surface-500 flex items-center justify-end pr-1"
                >
                  {label}
                </div>
              ))}
            </div>

            {/* Weeks */}
            <div className="flex gap-1 py-1">
              {weeks.map((week, weekIndex) => {
                // Find first day in week that's within our active months (not padding)
                const firstRealDay = week.find((day) => {
                  const dateKey = formatInTimeZone(
                    day.date,
                    "UTC",
                    "yyyy-MM-dd"
                  );
                  return gridDays.some(
                    (gd) =>
                      formatInTimeZone(gd.date, "UTC", "yyyy-MM-dd") === dateKey
                  );
                });

                // Get previous week's month for comparison
                const prevWeek = weekIndex > 0 ? weeks[weekIndex - 1] : null;
                const prevWeekFirstRealDay = prevWeek
                  ? prevWeek.find((day) => {
                      const dateKey = formatInTimeZone(
                        day.date,
                        "UTC",
                        "yyyy-MM-dd"
                      );
                      return gridDays.some(
                        (gd) =>
                          formatInTimeZone(gd.date, "UTC", "yyyy-MM-dd") ===
                          dateKey
                      );
                    })
                  : null;

                const currentMonth = firstRealDay
                  ? formatInTimeZone(firstRealDay.date, "UTC", "yyyy-MM")
                  : null;
                const prevMonth = prevWeekFirstRealDay
                  ? formatInTimeZone(
                      prevWeekFirstRealDay.date,
                      "UTC",
                      "yyyy-MM"
                    )
                  : null;

                // Show month label if:
                // 1. First week, or
                // 2. Month changed from previous week
                const shouldShowMonth =
                  firstRealDay &&
                  (weekIndex === 0 || currentMonth !== prevMonth);

                // Add gap when month changes (but not for the first week)
                const isMonthTransition =
                  weekIndex > 0 && currentMonth !== prevMonth;

                return (
                  <div
                    key={weekIndex}
                    className={cn(
                      "flex flex-col gap-1",
                      isMonthTransition && "ml-2"
                    )}
                  >
                    {/* Month label */}
                    {shouldShowMonth && firstRealDay ? (
                      <div className="h-3 w-3 text-[11px] leading-none text-surface-500 flex items-center justify-start">
                        {formatInTimeZone(firstRealDay.date, "UTC", "MMM")}
                      </div>
                    ) : (
                      <div className="h-3 w-3" />
                    )}

                    {/* Days in week */}
                    {week.map((day, dayIndex) => {
                      const intensity = day.data
                        ? getIntensity(day.data.credits)
                        : 0;
                      const dateStr = formatDate(day.date);
                      const credits = day.data?.credits ?? 0;
                      const count = day.data?.count ?? 0;
                      const hasData = !!day.data;

                      const isHovered =
                        hoveredDay?.weekIndex === weekIndex &&
                        hoveredDay?.dayIndex === dayIndex;

                      return (
                        <div
                          key={`${weekIndex}-${dayIndex}`}
                          className="relative group"
                          onMouseEnter={() =>
                            setHoveredDay({ weekIndex, dayIndex })
                          }
                          onMouseLeave={() => setHoveredDay(null)}
                        >
                          <div
                            className={cn(
                              "w-3 h-3 rounded-sm transition-all",
                              hasData &&
                                "hover:ring-2 hover:ring-accent-400 hover:ring-offset-1 cursor-pointer",
                              !hasData && "opacity-50",
                              intensity === 0 && "bg-surface-200",
                              intensity === 1 && "bg-accent-200",
                              intensity === 2 && "bg-accent-400",
                              intensity === 3 && "bg-accent-600",
                              intensity === 4 && "bg-accent-700"
                            )}
                            aria-label={
                              hasData
                                ? `${dateStr}: ${credits.toFixed(2)} credits, ${count} ${count === 1 ? "message" : "messages"}`
                                : `${dateStr}: No activity`
                            }
                          />
                          {isHovered && (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-[100] px-3 py-2 bg-surface-50 border border-surface-300 text-surface-900 text-[11px] rounded-xl shadow-card pointer-events-none whitespace-nowrap">
                              <div className="font-semibold mb-1.5 text-surface-900">
                                {dateStr}
                              </div>
                              {hasData ? (
                                <>
                                  <div className="text-surface-800 mb-0.5 font-mono">
                                    {credits.toFixed(2)} credits
                                  </div>
                                  <div className="text-surface-600">
                                    {count}{" "}
                                    {count === 1 ? "message" : "messages"}
                                  </div>
                                </>
                              ) : (
                                <div className="text-surface-600">
                                  No activity
                                </div>
                              )}
                              {/* Tooltip arrow */}
                              <div
                                className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-surface-300"
                                aria-hidden="true"
                              />
                              <div
                                className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] w-0 h-0 border-l-[5px] border-r-[5px] border-t-[5px] border-transparent border-t-surface-50"
                                aria-hidden="true"
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-start gap-2 text-sm text-surface-600">
        <span>Less</span>
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className={cn(
                "w-3 h-3 rounded-sm",
                level === 0 && "bg-surface-200",
                level === 1 && "bg-accent-200",
                level === 2 && "bg-accent-400",
                level === 3 && "bg-accent-600",
                level === 4 && "bg-accent-700"
              )}
              aria-hidden="true"
            />
          ))}
        </div>
        <span>More</span>
      </div>

      <p className="text-xs text-surface-500 text-left">
        {dayData.length} days with activity
      </p>
    </div>
  );
}
