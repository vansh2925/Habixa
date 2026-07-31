'use client';

import { useEffect, useMemo, useState } from 'react';
import { useHabitStore } from '@/store/habit-store';
import { getActiveHabits, isHabitCompletedOnDate } from '@/lib/calculations';
import { isHabitScheduledOnDate } from '@/lib/schedule';
import { format, subDays } from 'date-fns';
import { MISS_REASONS } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { X, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const REASON_EMOJI: Record<string, string> = {
  'no-time': '⏰',
  forgot: '🤷',
  'low-energy': '🪫',
  'not-motivated': '😩',
};

export function MissReasonPrompt() {
  const { habits, entries, setMissReason, currentYear, currentMonth } = useHabitStore();
  const activeHabits = getActiveHabits(habits);
  const [dismissed, setDismissed] = useState(false);

  // Find the most recent day before today with missed (scheduled, uncompleted, no reason) habits
  const missedDay = useMemo(() => {
    for (let back = 1; back <= 3; back++) {
      const date = subDays(new Date(), back);
      const dateStr = format(date, 'yyyy-MM-dd');
      // Only consider the current/previous month context
      const missed = activeHabits.filter(h => {
        if (!isHabitScheduledOnDate(h, date)) return false;
        if (isHabitCompletedOnDate(entries, h.id, dateStr)) return false;
        // Already has a reason?
        const entry = entries.find(e => e.habitId === h.id && e.date === dateStr);
        return !entry?.missedReason;
      });
      if (missed.length > 0) {
        return { date, dateStr, habits: missed };
      }
    }
    return null;
  }, [activeHabits, entries, currentYear, currentMonth]);

  // Auto-dismiss after 10s if never interacted
  useEffect(() => {
    if (!missedDay) return;
    const t = setTimeout(() => setDismissed(true), 10000);
    return () => clearTimeout(t);
  }, [missedDay]);

  if (!missedDay || dismissed) return null;

  const dayLabel = format(missedDay.date, 'EEEE');

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, height: 0 }}
        className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-50 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-[#4F6BED]" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              You missed {missedDay.habits.length} habit{missedDay.habits.length > 1 ? 's' : ''} on {dayLabel}
            </h3>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            Why? This helps your insights figure out the real cause — not just when you skip.
          </p>

          {/* Reason buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {MISS_REASONS.map(r => (
              <button
                key={r.value}
                onClick={() => {
                  missedDay.habits.forEach(h => setMissReason(h.id, missedDay.dateStr, r.value));
                  setDismissed(true);
                }}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-gray-50 dark:bg-gray-800 hover:bg-[#4F6BED]/10 border border-gray-100 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors"
              >
                <span>{REASON_EMOJI[r.value]}</span>
                {r.label}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between mt-3">
            <p className="text-[11px] text-gray-400 dark:text-gray-500 flex items-center gap-1">
              <span className={cn('w-1.5 h-1.5 rounded-full bg-[#F59E0B]')} />
              One tap — takes 2 seconds
            </p>
            <button
              onClick={() => setDismissed(true)}
              className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              Not now
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
