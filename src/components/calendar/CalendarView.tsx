'use client';

import { useHabitStore } from '@/store/habit-store';
import { getActiveHabits, isHabitCompletedOnDate, getEntriesForMonth } from '@/lib/calculations';
import { getDaysInMonthArray, formatDateKey, getMonthName } from '@/lib/date-utils';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { WEEKDAYS } from '@/lib/constants';

export function CalendarView() {
  const { habits, entries, currentYear, currentMonth } = useHabitStore();
  const activeHabits = getActiveHabits(habits);
  const days = getDaysInMonthArray(currentYear, currentMonth);
  const todayStr = formatDateKey(new Date());

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Calendar</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {getMonthName(currentMonth)} {currentYear} overview
        </p>
      </div>

      <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden p-5">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {WEEKDAYS.map(day => (
            <div key={day} className="text-center text-xs font-semibold text-gray-400 dark:text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((date, i) => {
            if (!date) {
              return <div key={`empty-${i}`} className="aspect-square" />;
            }

            const dateStr = formatDateKey(date);
            const isToday = dateStr === todayStr;
            const completedCount = activeHabits.filter(h =>
              isHabitCompletedOnDate(entries, h.id, dateStr)
            ).length;
            const total = activeHabits.length;
            const percentage = total > 0 ? completedCount / total : 0;

            return (
              <motion.div
                key={dateStr}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.005 }}
                className={cn(
                  'aspect-square rounded-lg flex flex-col items-center justify-center gap-0.5 transition-all duration-150',
                  'hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-default',
                  isToday && 'ring-2 ring-[#4F6BED] ring-offset-1 dark:ring-offset-[#1a1a1a]',
                  percentage >= 0.8 && 'bg-[#22C55E]/10',
                  percentage >= 0.5 && percentage < 0.8 && 'bg-[#F59E0B]/10',
                  percentage > 0 && percentage < 0.5 && 'bg-[#4F6BED]/5',
                )}
              >
                <span className={cn(
                  'text-sm font-medium',
                  isToday ? 'text-[#4F6BED] font-bold' : 'text-gray-700 dark:text-gray-300'
                )}>
                  {date.getDate()}
                </span>

                {completedCount > 0 && (
                  <div className="flex items-center gap-0.5">
                    <div className={cn(
                      'w-1.5 h-1.5 rounded-full',
                      percentage >= 0.8 ? 'bg-[#22C55E]' :
                      percentage >= 0.5 ? 'bg-[#F59E0B]' :
                      'bg-[#4F6BED]'
                    )} />
                    <span className="text-[9px] text-gray-500 dark:text-gray-400 font-medium">
                      {completedCount}/{total}
                    </span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-[#22C55E]/20" />
          <span>80%+ complete</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-[#F59E0B]/20" />
          <span>50-79%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-[#4F6BED]/10" />
          <span>&lt;50%</span>
        </div>
      </div>
    </div>
  );
}
