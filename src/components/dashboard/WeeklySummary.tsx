'use client';

import { useHabitStore } from '@/store/habit-store';
import { getActiveHabits, getEntriesForMonth, getWeeklyStats } from '@/lib/calculations';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function WeeklySummary() {
  const { habits, entries, currentYear, currentMonth } = useHabitStore();
  const activeHabits = getActiveHabits(habits);
  const monthEntries = getEntriesForMonth(entries, currentYear, currentMonth);
  const weeklyStats = getWeeklyStats(monthEntries, activeHabits, currentYear, currentMonth);

  return (
    <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-100 dark:border-gray-800 p-5">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Weekly Progress</h3>

      <div className="space-y-3">
        {weeklyStats.map((week, i) => (
          <motion.div
            key={week.week}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                Week {week.week}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {week.completed}/{week.total}
                </span>
                <span className={cn(
                  'text-xs font-semibold',
                  week.percentage >= 0.8 ? 'text-[#22C55E]' :
                  week.percentage >= 0.5 ? 'text-[#F59E0B]' :
                  'text-gray-400'
                )}>
                  {Math.round(week.percentage * 100)}%
                </span>
              </div>
            </div>

            <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${week.percentage * 100}%` }}
                transition={{ delay: 0.2 + i * 0.1, duration: 0.5, ease: 'easeOut' }}
                className={cn(
                  'h-full rounded-full',
                  week.percentage >= 0.8 ? 'bg-[#22C55E]' :
                  week.percentage >= 0.5 ? 'bg-[#F59E0B]' :
                  'bg-[#4F6BED]'
                )}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
