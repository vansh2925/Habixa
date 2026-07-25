'use client';

import { useMemo } from 'react';
import { useHabitStore } from '@/store/habit-store';
import { getActiveHabits, getEntriesForMonth, getDailyStats } from '@/lib/calculations';
import { getMonthName, getDaysInMonth } from '@/lib/date-utils';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getIntensityColor(percentage: number): string {
  if (percentage >= 0.9) return 'bg-[#22C55E]';
  if (percentage >= 0.7) return 'bg-[#22C55E]/80';
  if (percentage >= 0.5) return 'bg-[#22C55E]/55';
  if (percentage >= 0.3) return 'bg-[#22C55E]/30';
  if (percentage > 0) return 'bg-[#22C55E]/15';
  return 'bg-gray-100 dark:bg-gray-800';
}

export function HeatmapCalendar() {
  const { habits, entries, currentYear, currentMonth } = useHabitStore();
  const activeHabits = getActiveHabits(habits);
  const monthEntries = getEntriesForMonth(entries, currentYear, currentMonth);
  const dailyStats = getDailyStats(monthEntries, activeHabits, currentYear, currentMonth);

  const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1).getDay();
  const daysInMonth = getDaysInMonth(new Date(currentYear, currentMonth - 1));

  const heatmapData = useMemo(() => {
    const data: (number | null)[] = [];

    // Leading empty cells
    for (let i = 0; i < firstDayOfMonth; i++) {
      data.push(null);
    }

    // Day cells
    for (let d = 1; d <= daysInMonth; d++) {
      const stat = dailyStats.find(s => s.day === d);
      data.push(stat ? stat.percentage : 0);
    }

    return data;
  }, [dailyStats, firstDayOfMonth, daysInMonth]);

  // Monthly stats
  const totalDays = dailyStats.length;
  const activeDays = dailyStats.filter(d => d.completed > 0).length;
  const perfectDays = dailyStats.filter(d => d.percentage >= 1).length;
  const avgCompletion = dailyStats.length > 0
    ? dailyStats.reduce((sum, d) => sum + d.percentage, 0) / dailyStats.length
    : 0;

  // Current streak
  let currentStreak = 0;
  for (let d = daysInMonth; d >= 1; d--) {
    const stat = dailyStats.find(s => s.day === d);
    if (stat && stat.percentage > 0) {
      currentStreak++;
    } else {
      break;
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Contribution Heatmap</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {getMonthName(currentMonth)} {currentYear}
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Active Days', value: activeDays, color: '#4F6BED' },
          { label: 'Perfect Days', value: perfectDays, color: '#22C55E' },
          { label: 'Current Streak', value: `${currentStreak}d`, color: '#F59E0B' },
          { label: 'Avg Completion', value: `${Math.round(avgCompletion * 100)}%`, color: '#8B5CF6' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-100 dark:border-gray-800 p-3 text-center"
          >
            <div className="text-lg font-bold" style={{ color: stat.color }}>{stat.value}</div>
            <div className="text-[10px] text-gray-500 mt-0.5">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Heatmap grid */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-100 dark:border-gray-800 p-5">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
          {getMonthName(currentMonth)} Activity
        </h3>

        {/* Weekday labels */}
        <div className="grid grid-cols-7 gap-1.5 mb-1">
          {WEEKDAYS.map(day => (
            <div key={day} className="text-center text-[10px] font-medium text-gray-400 dark:text-gray-500 py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Heatmap cells */}
        <div className="grid grid-cols-7 gap-1.5">
          {heatmapData.map((percentage, i) => {
            if (percentage === null) {
              return <div key={`empty-${i}`} className="aspect-square" />;
            }

            const dayNum = i - firstDayOfMonth + 1;
            const isToday = new Date().getDate() === dayNum &&
                           new Date().getMonth() + 1 === currentMonth &&
                           new Date().getFullYear() === currentYear;

            return (
              <motion.div
                key={`day-${dayNum}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: dayNum * 0.01 }}
                className={cn(
                  'aspect-square rounded-lg flex items-center justify-center text-xs font-medium cursor-default transition-all duration-150',
                  getIntensityColor(percentage),
                  isToday && 'ring-2 ring-[#4F6BED] ring-offset-1 dark:ring-offset-[#1a1a1a]',
                  percentage > 0 ? 'text-white' : 'text-gray-400 dark:text-gray-500'
                )}
                title={`Day ${dayNum}: ${Math.round(percentage * 100)}% complete`}
              >
                {dayNum}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-100 dark:border-gray-800 p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Less</span>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-gray-100 dark:bg-gray-800" />
            <div className="w-4 h-4 rounded bg-[#22C55E]/15" />
            <div className="w-4 h-4 rounded bg-[#22C55E]/30" />
            <div className="w-4 h-4 rounded bg-[#22C55E]/55" />
            <div className="w-4 h-4 rounded bg-[#22C55E]/80" />
            <div className="w-4 h-4 rounded bg-[#22C55E]" />
          </div>
          <span className="text-xs text-gray-500">More</span>
        </div>
      </div>

      {/* Monthly breakdown */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-100 dark:border-gray-800 p-5">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Day-by-Day Breakdown</h3>
        <div className="space-y-1 max-h-[300px] overflow-y-auto">
          {dailyStats.map((stat, i) => (
            <motion.div
              key={stat.day}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.01 }}
              className="flex items-center gap-3 py-1.5"
            >
              <span className="text-xs text-gray-500 w-6 text-right">{stat.day}</span>
              <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-300',
                    stat.percentage >= 0.8 ? 'bg-[#22C55E]' :
                    stat.percentage >= 0.5 ? 'bg-[#F59E0B]' :
                    stat.percentage > 0 ? 'bg-[#4F6BED]' :
                    'bg-gray-200 dark:bg-gray-700'
                  )}
                  style={{ width: `${stat.percentage * 100}%` }}
                />
              </div>
              <span className="text-[10px] text-gray-400 w-8 text-right">
                {Math.round(stat.percentage * 100)}%
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
