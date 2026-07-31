import { Habit, HabitEntry, MonthlyStats, DailyStat, WeeklyStat, HabitStat, DashboardData } from '@/types';
import { formatDateKey, getDaysInMonth, getWeekRanges } from './date-utils';
import { isHabitScheduledOnDate, countScheduledDaysInMonth } from './schedule';

export function getActiveHabits(habits: Habit[]): Habit[] {
  return habits.filter(h => h.isActive).sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getEntriesForMonth(entries: HabitEntry[], year: number, month: number): HabitEntry[] {
  const prefix = `${year}-${String(month).padStart(2, '0')}`;
  return entries.filter(e => e.date.startsWith(prefix));
}

export function getEntriesForDate(entries: HabitEntry[], date: string): HabitEntry[] {
  return entries.filter(e => e.date === date);
}

export function isHabitCompletedOnDate(entries: HabitEntry[], habitId: string, date: string): boolean {
  return entries.some(e => e.habitId === habitId && e.date === date && e.completed);
}

export function getDailyStats(entries: HabitEntry[], activeHabits: Habit[], year: number, month: number): DailyStat[] {
  const daysInMonth = getDaysInMonth(new Date(year, month - 1));
  const stats: DailyStat[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayEntries = entries.filter(e => e.date === dateStr);
    const completed = dayEntries.filter(e => e.completed).length;
    // Only count habits that are actually scheduled on this day
    const scheduledHabits = activeHabits.filter(h => isHabitScheduledOnDate(h, date));
    const total = scheduledHabits.length;

    stats.push({
      date: dateStr,
      day,
      completed,
      total,
      remaining: total - completed,
      percentage: total > 0 ? completed / total : 0,
    });
  }

  return stats;
}

export function getWeeklyStats(entries: HabitEntry[], activeHabits: Habit[], year: number, month: number): WeeklyStat[] {
  const ranges = getWeekRanges(year, month);
  const daysInMonth = getDaysInMonth(new Date(year, month - 1));

  return ranges.map((range, index) => {
    let completed = 0;
    let total = 0;

    for (let day = range.start; day <= range.end; day++) {
      const date = new Date(year, month - 1, day);
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayEntries = entries.filter(e => e.date === dateStr);
      completed += dayEntries.filter(e => e.completed).length;
      // Count only scheduled habit-days
      const scheduled = activeHabits.filter(h => isHabitScheduledOnDate(h, date)).length;
      total += scheduled;
    }

    return {
      week: index + 1,
      startDate: `${year}-${String(month).padStart(2, '0')}-${String(range.start).padStart(2, '0')}`,
      endDate: `${year}-${String(month).padStart(2, '0')}-${String(range.end).padStart(2, '0')}`,
      completed,
      total,
      percentage: total > 0 ? completed / total : 0,
    };
  });
}

export function getHabitStats(entries: HabitEntry[], activeHabits: Habit[], year: number, month: number): HabitStat[] {
  const daysInMonth = getDaysInMonth(new Date(year, month - 1));

  const stats = activeHabits.map(habit => {
    // Real goal = number of scheduled days this month (not full month)
    const goal = countScheduledDaysInMonth(habit, year, month);
    let completed = 0;
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      // Only count completions on scheduled days
      if (!isHabitScheduledOnDate(habit, date)) continue;
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      if (entries.some(e => e.habitId === habit.id && e.date === dateStr && e.completed)) {
        completed++;
      }
    }

    return {
      habitId: habit.id,
      habitName: habit.name,
      completed,
      goal,
      remaining: Math.max(0, goal - completed),
      percentage: goal > 0 ? completed / goal : 0,
      rank: 0,
    };
  });

  // Sort by completion percentage descending and assign ranks
  stats.sort((a, b) => b.percentage - a.percentage);
  stats.forEach((stat, index) => {
    stat.rank = index + 1;
  });

  return stats;
}

export function calculateMonthlyStats(entries: HabitEntry[], activeHabits: Habit[], year: number, month: number): MonthlyStats {
  const dailyStats = getDailyStats(entries, activeHabits, year, month);
  const weeklyStats = getWeeklyStats(entries, activeHabits, year, month);
  const habitStats = getHabitStats(entries, activeHabits, year, month);

  const totalCompleted = entries.filter(e => e.completed).length;
  // Real monthly goal = sum of each habit's scheduled days this month
  const totalGoal = activeHabits.reduce((sum, h) => sum + countScheduledDaysInMonth(h, year, month), 0);
  const totalRemaining = Math.max(0, totalGoal - totalCompleted);

  return {
    totalCompleted,
    totalGoal,
    totalRemaining,
    overallProgress: totalGoal > 0 ? totalCompleted / totalGoal : 0,
    dailyStats,
    weeklyStats,
    habitStats,
  };
}

export function calculateStreak(entries: HabitEntry[], habitId: string, year: number, month: number): { current: number; longest: number } {
  const daysInMonth = getDaysInMonth(new Date(year, month - 1));
  let current = 0;
  let longest = 0;
  let tempStreak = 0;

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const completed = entries.some(e => e.habitId === habitId && e.date === dateStr && e.completed);

    if (completed) {
      tempStreak++;
      longest = Math.max(longest, tempStreak);
    } else {
      tempStreak = 0;
    }
  }

  // Current streak counts from the last completed day backwards
  current = 0;
  for (let day = daysInMonth; day >= 1; day--) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const completed = entries.some(e => e.habitId === habitId && e.date === dateStr && e.completed);
    if (completed) {
      current++;
    } else {
      break;
    }
  }

  return { current, longest };
}

/**
 * Overall streak with a built-in "streak freeze":
 * - A day counts toward the streak if it's a "good day" (≥ streakGoal% of habits done)
 * - Up to `freezePerWeek` missed days per 7-day window do NOT break the streak
 * This avoids the all-or-nothing trap where one bad day kills momentum.
 */
export function calculateOverallStreak(
  entries: HabitEntry[],
  activeHabits: Habit[],
  year: number,
  month: number,
  streakGoal = 0.6,       // a "good day" = ≥60% of habits completed
  freezePerWeek = 1       // allow 1 miss per 7 days without breaking
): { current: number; longest: number; frozenUsed: number; hasFreeze: boolean } {
  const daysInMonth = getDaysInMonth(new Date(year, month - 1));

  // Mark each day of the month as good (met goal) or miss
  const dayQualities: boolean[] = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayEntries = entries.filter(e => e.date === dateStr);
    const completedCount = dayEntries.filter(e => e.completed).length;
    const isGood = activeHabits.length > 0 && (completedCount / activeHabits.length) >= streakGoal;
    dayQualities.push(isGood);
  }

  // A miss only breaks the streak if it exceeds the freeze allowance
  // in the trailing 7-day window (counted from the miss going backward).
  const breaksStreak = (missIndex: number): boolean => {
    let misses = 0;
    for (let i = missIndex; i >= 0 && i > missIndex - 7; i--) {
      if (!dayQualities[i]) misses++;
    }
    // This miss is the one that pushes us over the allowance
    return misses > freezePerWeek;
  };

  // Current streak: walk backwards from the last day of the month
  let current = 0;
  let frozenUsed = 0;
  let broke = false;
  for (let day = daysInMonth - 1; day >= 0 && !broke; day--) {
    if (dayQualities[day]) {
      current++;
    } else if (!breaksStreak(day)) {
      // Freeze used — this miss is forgiven
      current++;
      frozenUsed++;
    } else {
      broke = true;
    }
  }

  // Longest streak: walk forward, applying the same freeze rule
  let longest = 0;
  let run = 0;
  for (let day = 0; day < daysInMonth; day++) {
    if (dayQualities[day]) {
      run++;
      longest = Math.max(longest, run);
    } else if (!breaksStreak(day)) {
      run++; // freeze forgives
      longest = Math.max(longest, run);
    } else {
      run = 0;
    }
  }

  return { current, longest, frozenUsed, hasFreeze: freezePerWeek > 0 };
}

/**
 * Rolling 7-day consistency: fraction of the last N days (up to `window`) that
 * met the "good day" goal. A friendlier headline metric than a fragile chain.
 */
export function calculateConsistency(
  entries: HabitEntry[],
  activeHabits: Habit[],
  year: number,
  month: number,
  window = 7,
  streakGoal = 0.6
): { percentage: number; goodDays: number; totalDays: number } {
  const daysInMonth = getDaysInMonth(new Date(year, month - 1));
  const goodDays: boolean[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayEntries = entries.filter(e => e.date === dateStr);
    const completedCount = dayEntries.filter(e => e.completed).length;
    goodDays.push(activeHabits.length > 0 && (completedCount / activeHabits.length) >= streakGoal);
  }

  const recent = goodDays.slice(-window);
  const good = recent.filter(Boolean).length;
  return { percentage: recent.length > 0 ? good / recent.length : 0, goodDays: good, totalDays: recent.length };
}

/**
 * Per-habit streak with the same freeze rule, so users can see each habit's
 * own momentum (a habit you're consistent on shows a streak even if you
 * missed it one day). Returns a map of habitId -> streak days.
 */
export function calculatePerHabitStreaks(
  entries: HabitEntry[],
  activeHabits: Habit[],
  year: number,
  month: number,
  freezePerWeek = 1
): Record<string, number> {
  const daysInMonth = getDaysInMonth(new Date(year, month - 1));
  const result: Record<string, number> = {};

  for (const habit of activeHabits) {
    // Build day-by-day completion for this habit
    const dayDone: boolean[] = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      dayDone.push(entries.some(e => e.habitId === habit.id && e.date === dateStr && e.completed));
    }

    const breaksStreak = (missIndex: number): boolean => {
      let misses = 0;
      for (let i = missIndex; i >= 0 && i > missIndex - 7; i--) {
        if (!dayDone[i]) misses++;
      }
      return misses > freezePerWeek;
    };

    // Current streak (from the end of the month backward)
    let streak = 0;
    for (let day = daysInMonth - 1; day >= 0; day--) {
      if (dayDone[day]) {
        streak++;
      } else if (!breaksStreak(day)) {
        streak++;
      } else {
        break;
      }
    }
    result[habit.id] = streak;
  }

  return result;
}

export function calculateDashboardData(
  entries: HabitEntry[],
  activeHabits: Habit[],
  year: number,
  month: number
): DashboardData {
  const today = new Date();
  const todayStr = formatDateKey(today);
  const todayEntries = entries.filter(e => e.date === todayStr);

  const todayCompleted = todayEntries.filter(e => e.completed).length;
  // Only habits scheduled today count toward today's total
  const todayTotal = activeHabits.filter(h => isHabitScheduledOnDate(h, today)).length;
  const todayRemaining = todayTotal - todayCompleted;
  const todayPercentage = todayTotal > 0 ? todayCompleted / todayTotal : 0;

  const daysInMonth = getDaysInMonth(new Date(year, month - 1));
  const monthlyCompleted = entries.filter(e => e.completed).length;
  const monthlyGoal = activeHabits.reduce((sum, h) => sum + countScheduledDaysInMonth(h, year, month), 0);
  const monthlyRemaining = Math.max(0, monthlyGoal - monthlyCompleted);
  const monthlyPercentage = monthlyGoal > 0 ? monthlyCompleted / monthlyGoal : 0;

  const streak = calculateOverallStreak(entries, activeHabits, year, month);
  const consistency = calculateConsistency(entries, activeHabits, year, month, 7);
  const weeklyStats = getWeeklyStats(entries, activeHabits, year, month);
  const topHabits = getHabitStats(entries, activeHabits, year, month).slice(0, 10);
  const recentActivity = getDailyStats(entries, activeHabits, year, month).slice(-7);

  return {
    todayCompleted,
    todayTotal,
    todayRemaining,
    todayPercentage,
    monthlyCompleted,
    monthlyGoal,
    monthlyRemaining,
    monthlyPercentage,
    currentStreak: streak.current,
    longestStreak: streak.longest,
    frozenUsed: streak.frozenUsed,
    hasFreeze: streak.hasFreeze,
    sevenDayConsistency: consistency.percentage,
    weeklyStats,
    topHabits,
    recentActivity,
  };
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
