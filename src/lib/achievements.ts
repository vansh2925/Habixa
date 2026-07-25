import { Achievement, Habit, HabitEntry } from '@/types';

export const ACHIEVEMENT_DEFINITIONS: Omit<Achievement, 'unlocked' | 'unlockedAt' | 'progress'>[] = [
  // Streak achievements
  { id: 'streak-3', name: 'Getting Started', description: 'Complete all habits for 3 days in a row', icon: '🌱', category: 'streak', requirement: 3, priority: 0 },
  { id: 'streak-7', name: 'One Week Warrior', description: 'Complete all habits for 7 days in a row', icon: '🔥', category: 'streak', requirement: 7, priority: 1 },
  { id: 'streak-14', name: 'Two Week Champion', description: 'Complete all habits for 14 days in a row', icon: '💪', category: 'streak', requirement: 14, priority: 2 },
  { id: 'streak-30', name: 'Monthly Master', description: 'Complete all habits for 30 days in a row', icon: '🏆', category: 'streak', requirement: 30, priority: 3 },
  { id: 'streak-60', name: 'Unstoppable', description: 'Complete all habits for 60 days in a row', icon: '⚡', category: 'streak', requirement: 60, priority: 4 },
  { id: 'streak-100', name: 'Century Club', description: 'Complete all habits for 100 days in a row', icon: '👑', category: 'streak', requirement: 100, priority: 5 },

  // Completion achievements
  { id: 'complete-50', name: 'Half Century', description: 'Complete 50 habit entries total', icon: '🎯', category: 'completion', requirement: 50, priority: 0 },
  { id: 'complete-100', name: 'Century Runner', description: 'Complete 100 habit entries total', icon: '💎', category: 'completion', requirement: 100, priority: 1 },
  { id: 'complete-500', name: 'Habit Hero', description: 'Complete 500 habit entries total', icon: '🦸', category: 'completion', requirement: 500, priority: 2 },
  { id: 'complete-1000', name: 'Legend', description: 'Complete 1000 habit entries total', icon: '🌟', category: 'completion', requirement: 1000, priority: 3 },

  // Consistency achievements
  { id: 'perfect-week', name: 'Perfect Week', description: 'Complete 100% for an entire week', icon: '✨', category: 'consistency', requirement: 1, priority: 0 },
  { id: 'perfect-month', name: 'Flawless Month', description: 'Complete 100% for an entire month', icon: '🌈', category: 'consistency', requirement: 1, priority: 2 },
  { id: 'consistent-80', name: 'Iron Discipline', description: 'Maintain 80%+ completion for 2 weeks', icon: '🎯', category: 'consistency', requirement: 14, priority: 1 },

  // Milestone achievements
  { id: 'first-habit', name: 'First Step', description: 'Complete your very first habit', icon: '🐣', category: 'milestone', requirement: 1, priority: 0 },
  { id: 'five-habits', name: 'Multi-Tasker', description: 'Complete 5 different habits in one day', icon: '🎪', category: 'milestone', requirement: 5, priority: 0 },
  { id: 'all-habits-day', name: 'Clean Sweep', description: 'Complete all habits in a single day', icon: '🏅', category: 'milestone', requirement: 1, priority: 1 },

  // Special achievements
  { id: 'early-bird', name: 'Early Bird', description: 'Log a habit completion before 6 AM', icon: '🌅', category: 'special', requirement: 1, priority: 0 },
  { id: 'night-owl', name: 'Night Owl', description: 'Log a habit completion after 11 PM', icon: '🦉', category: 'special', requirement: 1, priority: 0 },
  { id: 'comeback', name: 'Comeback Kid', description: 'Resume tracking after missing 3+ days', icon: '🔄', category: 'special', requirement: 1, priority: 1 },
];

export function calculateAchievements(
  habits: Habit[],
  entries: HabitEntry[],
  currentStreak: number,
  weeklyStats: { percentage: number }[]
): Achievement[] {
  const totalCompleted = entries.filter(e => e.completed).length;

  // Calculate longest all-habits streak
  const dates = [...new Set(entries.map(e => e.date))].sort();
  let longestAllStreak = 0;
  let tempStreak = 0;
  const activeHabits = habits.filter(h => h.isActive);

  for (let i = 1; i < dates.length; i++) {
    const prevEntries = entries.filter(e => e.date === dates[i - 1] && e.completed);
    const currEntries = entries.filter(e => e.date === dates[i] && e.completed);

    if (prevEntries.length >= activeHabits.length && currEntries.length >= activeHabits.length) {
      tempStreak++;
    } else {
      tempStreak = 0;
    }
    longestAllStreak = Math.max(longestAllStreak, tempStreak);
  }

  // Check perfect week/month
  const hasPerfectWeek = weeklyStats.some(w => w.percentage >= 1);
  const hasPerfectMonth = weeklyStats.length > 0 && weeklyStats.every(w => w.percentage >= 0.99);

  // Check 80%+ for 2 weeks
  const lastTwoWeeks = weeklyStats.slice(-2);
  const consistent80 = lastTwoWeeks.length >= 2 && lastTwoWeeks.every(w => w.percentage >= 0.8);

  // Unique habits completed today
  const today = new Date().toISOString().split('T')[0];
  const todayEntries = entries.filter(e => e.date === today && e.completed);
  const uniqueHabitsToday = new Set(todayEntries.map(e => e.habitId)).size;

  // Check for early bird / night owl
  const completedAtHours = entries
    .filter(e => e.completed && e.completedAt)
    .map(e => new Date(e.completedAt!).getHours());
  const hasEarlyBird = completedAtHours.some(h => h < 6);
  const hasNightOwl = completedAtHours.some(h => h >= 23);

  // Check comeback (gap of 3+ days then resumption)
  let hasComeback = false;
  const sortedDates = [...new Set(entries.map(e => e.date))].sort();
  for (let i = 1; i < sortedDates.length; i++) {
    const prev = new Date(sortedDates[i - 1]);
    const curr = new Date(sortedDates[i]);
    const diffDays = Math.floor((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays >= 4) { hasComeback = true; break; }
  }

  const bestStreak = Math.max(currentStreak, longestAllStreak);

  return ACHIEVEMENT_DEFINITIONS.map(def => {
    let progress = 0;
    let unlocked = false;

    switch (def.id) {
      case 'streak-3': case 'streak-7': case 'streak-14': case 'streak-30': case 'streak-60': case 'streak-100':
        progress = Math.min(1, bestStreak / def.requirement);
        unlocked = bestStreak >= def.requirement;
        break;
      case 'complete-50': case 'complete-100': case 'complete-500': case 'complete-1000':
        progress = Math.min(1, totalCompleted / def.requirement);
        unlocked = totalCompleted >= def.requirement;
        break;
      case 'perfect-week':
        progress = hasPerfectWeek ? 1 : 0;
        unlocked = hasPerfectWeek;
        break;
      case 'perfect-month':
        progress = hasPerfectMonth ? 1 : 0;
        unlocked = hasPerfectMonth;
        break;
      case 'consistent-80':
        progress = consistent80 ? 1 : 0;
        unlocked = consistent80;
        break;
      case 'first-habit':
        progress = totalCompleted >= 1 ? 1 : 0;
        unlocked = totalCompleted >= 1;
        break;
      case 'five-habits':
        progress = Math.min(1, uniqueHabitsToday / 5);
        unlocked = uniqueHabitsToday >= 5;
        break;
      case 'all-habits-day':
        progress = todayEntries.length >= activeHabits.length && activeHabits.length > 0 ? 1 : 0;
        unlocked = todayEntries.length >= activeHabits.length && activeHabits.length > 0;
        break;
      case 'early-bird':
        progress = hasEarlyBird ? 1 : 0;
        unlocked = hasEarlyBird;
        break;
      case 'night-owl':
        progress = hasNightOwl ? 1 : 0;
        unlocked = hasNightOwl;
        break;
      case 'comeback':
        progress = hasComeback ? 1 : 0;
        unlocked = hasComeback;
        break;
      default:
        progress = 0;
        unlocked = false;
    }

    return { ...def, unlocked, progress };
  }).sort((a, b) => {
    if (a.unlocked !== b.unlocked) return a.unlocked ? -1 : 1;
    return a.priority - b.priority;
  });
}
