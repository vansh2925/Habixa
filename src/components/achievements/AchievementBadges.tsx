'use client';

import { useMemo } from 'react';
import { useHabitStore } from '@/store/habit-store';
import { calculateAchievements } from '@/lib/achievements';
import { getActiveHabits, getEntriesForMonth, calculateOverallStreak, getWeeklyStats } from '@/lib/calculations';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Trophy, Lock } from 'lucide-react';

export function AchievementBadges() {
  const { habits, entries, currentYear, currentMonth } = useHabitStore();
  const activeHabits = getActiveHabits(habits);
  const monthEntries = getEntriesForMonth(entries, currentYear, currentMonth);
  const streak = calculateOverallStreak(monthEntries, activeHabits, currentYear, currentMonth);
  const weeklyStats = getWeeklyStats(monthEntries, activeHabits, currentYear, currentMonth);

  const achievements = useMemo(
    () => calculateAchievements(habits, entries, streak.current, weeklyStats),
    [habits, entries, streak.current, weeklyStats]
  );

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const total = achievements.length;

  const categories = [
    { key: 'streak', label: 'Streaks', color: '#EF4444' },
    { key: 'completion', label: 'Completion', color: '#4F6BED' },
    { key: 'consistency', label: 'Consistency', color: '#22C55E' },
    { key: 'milestone', label: 'Milestones', color: '#F59E0B' },
    { key: 'special', label: 'Special', color: '#8B5CF6' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Achievements</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {unlockedCount} of {total} unlocked
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#F59E0B]/10 rounded-lg">
          <Trophy className="w-4 h-4 text-[#F59E0B]" />
          <span className="text-sm font-semibold text-[#F59E0B]">{unlockedCount}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-100 dark:border-gray-800 p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Overall Progress</span>
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            {Math.round((unlockedCount / total) * 100)}%
          </span>
        </div>
        <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(unlockedCount / total) * 100}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full rounded-full bg-gradient-to-r from-[#F59E0B] to-[#EF4444]"
          />
        </div>
      </div>

      {/* Achievement categories */}
      {categories.map(cat => {
        const catAchievements = achievements.filter(a => a.category === cat.key);
        if (catAchievements.length === 0) return null;

        return (
          <div key={cat.key}>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
              {cat.label}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {catAchievements.map((achievement, i) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={cn(
                    'relative rounded-xl border p-4 transition-all duration-200',
                    achievement.unlocked
                      ? 'bg-white dark:bg-[#1a1a1a] border-[#F59E0B]/30 shadow-sm'
                      : 'bg-gray-50 dark:bg-[#111111] border-gray-100 dark:border-gray-800 opacity-60'
                  )}
                >
                  {achievement.unlocked && (
                    <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#22C55E] rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{achievement.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">
                        {achievement.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {achievement.description}
                      </div>

                      {!achievement.unlocked && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] text-gray-400">Progress</span>
                            <span className="text-[10px] text-gray-400">
                              {Math.round(achievement.progress * 100)}%
                            </span>
                          </div>
                          <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gray-400 dark:bg-gray-500"
                              style={{ width: `${achievement.progress * 100}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {achievement.unlocked && (
                        <div className="text-[10px] text-[#22C55E] mt-1 font-medium">
                          ✓ Unlocked
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
