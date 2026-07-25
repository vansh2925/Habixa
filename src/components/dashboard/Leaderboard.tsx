'use client';

import { useHabitStore } from '@/store/habit-store';
import { getActiveHabits, getEntriesForMonth, getHabitStats } from '@/lib/calculations';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Leaderboard() {
  const { habits, entries, currentYear, currentMonth } = useHabitStore();
  const activeHabits = getActiveHabits(habits);
  const monthEntries = getEntriesForMonth(entries, currentYear, currentMonth);
  const habitStats = getHabitStats(monthEntries, activeHabits, currentYear, currentMonth)
    .slice(0, 10);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-4 h-4 text-[#F59E0B]" />;
    if (rank === 2) return <Medal className="w-4 h-4 text-[#94A3B8]" />;
    if (rank === 3) return <Award className="w-4 h-4 text-[#CD7F32]" />;
    return <span className="text-xs font-semibold text-gray-400 w-4 text-center">#{rank}</span>;
  };

  const getRankBg = (rank: number) => {
    if (rank === 1) return 'bg-[#FEF3C7] dark:bg-[#F59E0B]/10';
    if (rank === 2) return 'bg-gray-50 dark:bg-gray-800/50';
    if (rank === 3) return 'bg-orange-50 dark:bg-orange-900/10';
    return '';
  };

  return (
    <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-50 dark:border-gray-800">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Top Habits</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          Ranked by completion rate
        </p>
      </div>

      <div className="divide-y divide-gray-50 dark:divide-gray-800">
        {habitStats.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-gray-400">
            No habit data yet. Start tracking!
          </div>
        ) : (
          habitStats.map((stat, i) => (
            <motion.div
              key={stat.habitId}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className={cn(
                'flex items-center gap-3 px-5 py-3',
                getRankBg(stat.rank)
              )}
            >
              <div className="w-6 flex items-center justify-center">
                {getRankIcon(stat.rank)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">
                  {stat.habitName}
                </div>
                <div className="text-[11px] text-gray-400 dark:text-gray-500">
                  {stat.completed}/{stat.goal} days
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-500',
                      stat.percentage >= 0.8 ? 'bg-[#22C55E]' :
                      stat.percentage >= 0.5 ? 'bg-[#F59E0B]' :
                      'bg-[#4F6BED]'
                    )}
                    style={{ width: `${stat.percentage * 100}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 w-10 text-right">
                  {Math.round(stat.percentage * 100)}%
                </span>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
