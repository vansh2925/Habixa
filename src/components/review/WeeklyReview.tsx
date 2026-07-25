'use client';

import { useMemo } from 'react';
import { useHabitStore } from '@/store/habit-store';
import { getActiveHabits, getEntriesForMonth, getDailyStats, getWeeklyStats, calculateOverallStreak } from '@/lib/calculations';
import { getMonthName } from '@/lib/date-utils';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus, Star, Target, Flame, Calendar, ArrowUp, ArrowDown } from 'lucide-react';

export function WeeklyReview() {
  const { habits, entries, currentYear, currentMonth } = useHabitStore();
  const activeHabits = getActiveHabits(habits);
  const monthEntries = getEntriesForMonth(entries, currentYear, currentMonth);
  const dailyStats = getDailyStats(monthEntries, activeHabits, currentYear, currentMonth);
  const weeklyStats = getWeeklyStats(monthEntries, activeHabits, currentYear, currentMonth);
  const streak = calculateOverallStreak(monthEntries, activeHabits, currentYear, currentMonth);

  const review = useMemo(() => {
    if (weeklyStats.length === 0) return null;

    const currentWeek = weeklyStats[weeklyStats.length - 1];
    const previousWeek = weeklyStats.length > 1 ? weeklyStats[weeklyStats.length - 2] : null;

    // Find best and worst days in current week
    const weekDays = dailyStats.filter(d => {
      const dayNum = d.day;
      return dayNum >= (currentWeek.startDate ? parseInt(currentWeek.startDate.split('-')[2]) : 1) &&
             dayNum <= (currentWeek.endDate ? parseInt(currentWeek.endDate.split('-')[2]) : 31);
    });

    const sortedByScore = [...weekDays].sort((a, b) => b.percentage - a.percentage);
    const bestDay = sortedByScore[0] || { day: 'N/A', percentage: 0 };
    const worstDay = sortedByScore[sortedByScore.length - 1] || { day: 'N/A', percentage: 0 };

    // Habit breakdown for current week
    const habitBreakdown = activeHabits.map(habit => {
      let completed = 0;
      const target = 7; // per week
      weekDays.forEach(d => {
        if (entries.some(e => e.habitId === habit.id && e.date === d.date && e.completed)) {
          completed++;
        }
      });

      // Calculate trend from previous week
      let trend: 'improving' | 'stable' | 'declining' = 'stable';
      if (previousWeek) {
        const prevWeekStart = parseInt(previousWeek.startDate.split('-')[2]);
        const prevWeekEnd = parseInt(previousWeek.endDate.split('-')[2]);
        let prevCompleted = 0;
        for (let d = prevWeekStart; d <= prevWeekEnd; d++) {
          const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          if (entries.some(e => e.habitId === habit.id && e.date === dateStr && e.completed)) {
            prevCompleted++;
          }
        }
        if (completed > prevCompleted) trend = 'improving';
        else if (completed < prevCompleted) trend = 'declining';
      }

      return { habitId: habit.id, habitName: habit.name, completed, target, streak: 0, trend };
    });

    // Comparison
    const comparison = previousWeek
      ? ((currentWeek.percentage - previousWeek.percentage) / (previousWeek.percentage || 1)) * 100
      : 0;

    // Generate insights
    const insights: string[] = [];
    const overallScore = Math.round(currentWeek.percentage * 100);

    if (overallScore >= 90) insights.push('Outstanding week! You\'re building incredible momentum.');
    else if (overallScore >= 70) insights.push('Solid week! You\'re consistently making progress.');
    else if (overallScore >= 50) insights.push('Decent effort. Focus on your top 2-3 habits to improve.');
    else insights.push('Tough week. Try picking just one habit to focus on next week.');

    const improving = habitBreakdown.filter(h => h.trend === 'improving');
    const declining = habitBreakdown.filter(h => h.trend === 'declining');

    if (improving.length > 0) {
      insights.push(`${improving.map(h => h.habitName).join(', ')} ${improving.length > 1 ? 'are' : 'is'} improving. Keep it up!`);
    }
    if (declining.length > 0) {
      insights.push(`Watch out for ${declining.map(h => h.habitName).join(', ')} — ${declining.length > 1 ? 'they need' : 'it needs'} attention.`);
    }

    return {
      weekNumber: currentWeek.week,
      overallScore,
      totalCompleted: currentWeek.completed,
      totalTarget: currentWeek.total,
      bestDay: { day: getMonthName(currentMonth) + ' ' + bestDay.day, score: Math.round(bestDay.percentage * 100) },
      worstDay: { day: getMonthName(currentMonth) + ' ' + worstDay.day, score: Math.round(worstDay.percentage * 100) },
      habitBreakdown,
      insights,
      comparison: Math.round(comparison),
    };
  }, [weeklyStats, dailyStats, activeHabits, entries, currentYear, currentMonth]);

  if (!review) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Weekly Review</h2>
        <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-100 dark:border-gray-800 p-8 text-center">
          <Calendar className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-sm text-gray-500">No weekly data yet. Start tracking to see your review!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Weekly Review</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Week {review.weekNumber} of {getMonthName(currentMonth)} {currentYear}
        </p>
      </div>

      {/* Score card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          'rounded-xl border p-6',
          review.overallScore >= 80 ? 'bg-[#22C55E]/5 border-[#22C55E]/20' :
          review.overallScore >= 50 ? 'bg-[#F59E0B]/5 border-[#F59E0B]/20' :
          'bg-[#EF4444]/5 border-[#EF4444]/20'
        )}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Weekly Score</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-4xl font-bold text-gray-900 dark:text-white">{review.overallScore}</span>
              <span className="text-lg text-gray-400">/100</span>
            </div>
          </div>
          <div className={cn(
            'flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-semibold',
            review.comparison > 0 ? 'bg-[#22C55E]/10 text-[#22C55E]' :
            review.comparison < 0 ? 'bg-[#EF4444]/10 text-[#EF4444]' :
            'bg-gray-100 dark:bg-gray-800 text-gray-500'
          )}>
            {review.comparison > 0 ? <ArrowUp className="w-3.5 h-3.5" /> :
             review.comparison < 0 ? <ArrowDown className="w-3.5 h-3.5" /> :
             <Minus className="w-3.5 h-3.5" />}
            {Math.abs(review.comparison)}% vs last week
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-white/50 dark:bg-white/5 rounded-lg p-3">
            <p className="text-xs text-gray-500">Completed</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{review.totalCompleted}/{review.totalTarget}</p>
          </div>
          <div className="bg-white/50 dark:bg-white/5 rounded-lg p-3">
            <p className="text-xs text-gray-500">Current Streak</p>
            <p className="text-lg font-bold text-[#F59E0B]">{streak.current} days 🔥</p>
          </div>
        </div>
      </motion.div>

      {/* Best & Worst days */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-100 dark:border-gray-800 p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-4 h-4 text-[#F59E0B]" />
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Best Day</span>
          </div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">{review.bestDay.day}</p>
          <p className="text-2xl font-bold text-[#22C55E] mt-1">{review.bestDay.score}%</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-100 dark:border-gray-800 p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-[#EF4444]" />
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Needs Focus</span>
          </div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">{review.worstDay.day}</p>
          <p className="text-2xl font-bold text-[#EF4444] mt-1">{review.worstDay.score}%</p>
        </motion.div>
      </div>

      {/* Habit breakdown */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 dark:border-gray-800">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Habit Breakdown</h3>
        </div>
        <div className="divide-y divide-gray-50 dark:divide-gray-800/50">
          {review.habitBreakdown.map((habit, i) => (
            <motion.div
              key={habit.habitId}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.05 * i }}
              className="flex items-center gap-3 px-5 py-3"
            >
              <span className="text-sm text-gray-700 dark:text-gray-200 flex-1 truncate">{habit.habitName}</span>
              <span className="text-xs text-gray-500 w-12 text-right">{habit.completed}/{habit.target}</span>
              <div className="w-16 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full',
                    habit.completed / habit.target >= 0.8 ? 'bg-[#22C55E]' :
                    habit.completed / habit.target >= 0.5 ? 'bg-[#F59E0B]' :
                    'bg-[#EF4444]'
                  )}
                  style={{ width: `${(habit.completed / habit.target) * 100}%` }}
                />
              </div>
              <div className="w-5 flex items-center justify-center">
                {habit.trend === 'improving' && <TrendingUp className="w-3.5 h-3.5 text-[#22C55E]" />}
                {habit.trend === 'declining' && <TrendingDown className="w-3.5 h-3.5 text-[#EF4444]" />}
                {habit.trend === 'stable' && <Minus className="w-3.5 h-3.5 text-gray-300" />}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Insights */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-100 dark:border-gray-800 p-5">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Key Insights</h3>
        <div className="space-y-2">
          {review.insights.map((insight, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300"
            >
              <span className="text-[#4F6BED] mt-0.5">•</span>
              {insight}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
