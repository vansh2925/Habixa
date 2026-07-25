'use client';

import { useHabitStore } from '@/store/habit-store';
import { getActiveHabits, isHabitCompletedOnDate } from '@/lib/calculations';
import { getTodayString } from '@/lib/date-utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export function TodayHabits() {
  const { habits, entries, toggleEntry } = useHabitStore();
  const activeHabits = getActiveHabits(habits);
  const today = getTodayString();
  const completedCount = activeHabits.filter(h =>
    isHabitCompletedOnDate(entries, h.id, today)
  ).length;

  return (
    <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50 dark:border-gray-800">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Today</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {completedCount} of {activeHabits.length} completed
          </p>
        </div>
        <div className="text-xs font-medium text-[#4F6BED] bg-[#EEF0FF] dark:bg-[#4F6BED]/20 px-2.5 py-1 rounded-full">
          {activeHabits.length > 0 ? Math.round((completedCount / activeHabits.length) * 100) : 0}%
        </div>
      </div>

      <div className="divide-y divide-gray-50 dark:divide-gray-800 max-h-[400px] overflow-y-auto">
        <AnimatePresence>
          {activeHabits.map((habit, i) => {
            const completed = isHabitCompletedOnDate(entries, habit.id, today);
            return (
              <motion.button
                key={habit.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02 }}
                onClick={() => toggleEntry(habit.id, today)}
                className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-150 group"
              >
                <div
                  className={cn(
                    'w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200',
                    completed
                      ? 'bg-[#22C55E] border-[#22C55E]'
                      : 'border-gray-300 dark:border-gray-600 group-hover:border-[#4F6BED]'
                  )}
                >
                  {completed && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    >
                      <Check className="w-3 h-3 text-white" strokeWidth={3} />
                    </motion.div>
                  )}
                </div>

                <span
                  className={cn(
                    'text-sm font-medium text-left flex-1 transition-colors duration-200',
                    completed
                      ? 'text-gray-400 dark:text-gray-500 line-through'
                      : 'text-gray-700 dark:text-gray-200'
                  )}
                >
                  {habit.name}
                </span>

                <span className="text-[11px] text-gray-400 dark:text-gray-500 capitalize">
                  {habit.category}
                </span>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
