import { Habit, ScheduleType } from '@/types';
import { getDaysInMonth } from './date-utils';

// Default days for each schedule type
const DEFAULT_DAYS: Record<Exclude<ScheduleType, 'custom' | 'timesPerWeek'>, number[]> = {
  daily: [0, 1, 2, 3, 4, 5, 6],
  weekdays: [1, 2, 3, 4, 5],
  weekend: [0, 6],
};

// Returns the set of weekdays (0-6) a habit is scheduled to run on
export function getScheduleDays(habit: Habit): number[] {
  if (habit.scheduleType === 'custom') {
    return habit.scheduleDays?.length ? habit.scheduleDays : [1, 2, 3, 4, 5];
  }
  if (habit.scheduleType === 'timesPerWeek') {
    // timesPerWeek doesn't map to fixed days — handled separately
    return [];
  }
  return DEFAULT_DAYS[habit.scheduleType] || [0, 1, 2, 3, 4, 5, 6];
}

// Is this habit scheduled on a given date?
export function isHabitScheduledOnDate(habit: Habit, date: Date): boolean {
  const day = date.getDay();

  if (habit.scheduleType === 'timesPerWeek') {
    // Flexible frequency: scheduled every day by default, but the GOAL reflects
    // only "timesPerWeek" targets. So it's always "scheduled" — it just has a
    // weekly quota rather than per-day requirement.
    return true;
  }
  return getScheduleDays(habit).includes(day);
}

// Count how many scheduled days fall in a given month (the real goal)
export function countScheduledDaysInMonth(habit: Habit, year: number, month: number): number {
  const daysInMonth = getDaysInMonth(new Date(year, month - 1));

  if (habit.scheduleType === 'timesPerWeek') {
    // Approximate weekly frequency to a monthly target (4.33 weeks/month)
    const timesPerWeek = habit.timesPerWeek || 3;
    return Math.round((timesPerWeek / 7) * daysInMonth);
  }

  let count = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month - 1, d);
    if (getScheduleDays(habit).includes(date.getDay())) count++;
  }
  return count;
}

// Validate/normalize a schedule's days array
export function buildSchedule(scheduleType: ScheduleType, customDays: number[], timesPerWeek: number): {
  scheduleType: ScheduleType;
  scheduleDays: number[];
  timesPerWeek: number;
} {
  let days: number[] = [];
  if (scheduleType === 'custom') {
    days = customDays.filter(d => d >= 0 && d <= 6).sort();
  }
  return {
    scheduleType,
    scheduleDays: days,
    timesPerWeek: Math.max(1, Math.min(7, timesPerWeek)),
  };
}
