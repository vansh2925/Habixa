import { Habit, HabitEntry, MonthlyStats, DailyStat, WeeklyStat, HabitStat, DashboardData } from '@/types';
import { formatDateKey, getDaysInMonth, getWeekRanges } from './date-utils';

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
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayEntries = entries.filter(e => e.date === dateStr);
    const completed = dayEntries.filter(e => e.completed).length;
    const total = activeHabits.length;

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
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayEntries = entries.filter(e => e.date === dateStr);
      completed += dayEntries.filter(e => e.completed).length;
      total += activeHabits.length;
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
    let completed = 0;
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      if (entries.some(e => e.habitId === habit.id && e.date === dateStr && e.completed)) {
        completed++;
      }
    }

    return {
      habitId: habit.id,
      habitName: habit.name,
      completed,
      goal: habit.goalDays,
      remaining: Math.max(0, habit.goalDays - completed),
      percentage: habit.goalDays > 0 ? completed / habit.goalDays : 0,
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
  const totalGoal = activeHabits.length * getDaysInMonth(new Date(year, month - 1));
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

export function calculateOverallStreak(entries: HabitEntry[], activeHabits: Habit[], year: number, month: number): { current: number; longest: number } {
  const daysInMonth = getDaysInMonth(new Date(year, month - 1));
  let current = 0;
  let longest = 0;
  let tempStreak = 0;

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayEntries = entries.filter(e => e.date === dateStr);
    const completedCount = dayEntries.filter(e => e.completed).length;

    // A day is "complete" if all habits are done
    if (completedCount >= activeHabits.length && activeHabits.length > 0) {
      tempStreak++;
      longest = Math.max(longest, tempStreak);
    } else {
      tempStreak = 0;
    }
  }

  // Current streak from the end
  current = 0;
  for (let day = daysInMonth; day >= 1; day--) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayEntries = entries.filter(e => e.date === dateStr);
    const completedCount = dayEntries.filter(e => e.completed).length;

    if (completedCount >= activeHabits.length && activeHabits.length > 0) {
      current++;
    } else {
      break;
    }
  }

  return { current, longest };
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
  const todayTotal = activeHabits.length;
  const todayRemaining = todayTotal - todayCompleted;
  const todayPercentage = todayTotal > 0 ? todayCompleted / todayTotal : 0;

  const daysInMonth = getDaysInMonth(new Date(year, month - 1));
  const monthlyCompleted = entries.filter(e => e.completed).length;
  const monthlyGoal = activeHabits.length * daysInMonth;
  const monthlyRemaining = Math.max(0, monthlyGoal - monthlyCompleted);
  const monthlyPercentage = monthlyGoal > 0 ? monthlyCompleted / monthlyGoal : 0;

  const streak = calculateOverallStreak(entries, activeHabits, year, month);
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
    weeklyStats,
    topHabits,
    recentActivity,
  };
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
