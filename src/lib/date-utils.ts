import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  getDaysInMonth,
  parseISO,
  isToday,
} from 'date-fns';

export function getMonthDates(year: number, month: number): Date[] {
  const start = startOfMonth(new Date(year, month - 1));
  const end = endOfMonth(start);
  const weekStart = startOfWeek(start, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(end, { weekStartsOn: 0 });
  return eachDayOfInterval({ start: weekStart, end: weekEnd });
}

export function getDaysInMonthArray(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = endOfMonth(firstDay);
  const daysInMonth = getDaysInMonth(firstDay);
  const startDayOfWeek = firstDay.getDay(); // 0=Sun

  const days: (Date | null)[] = [];

  // Fill leading empty cells
  for (let i = 0; i < startDayOfWeek; i++) {
    days.push(null);
  }

  // Add all days of the month
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(new Date(year, month - 1, d));
  }

  // Fill trailing empty cells to complete the grid
  while (days.length % 7 !== 0) {
    days.push(null);
  }

  return days;
}

export function formatDateKey(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function parseDateKey(key: string): Date {
  return parseISO(key);
}

export function isDateToday(date: Date): boolean {
  return isToday(date);
}

export function isDateSameMonth(date: Date, year: number, month: number): boolean {
  return isSameMonth(date, new Date(year, month - 1));
}

export function getNextMonth(year: number, month: number): { year: number; month: number } {
  const next = addMonths(new Date(year, month - 1), 1);
  return { year: next.getFullYear(), month: next.getMonth() + 1 };
}

export function getPrevMonth(year: number, month: number): { year: number; month: number } {
  const prev = subMonths(new Date(year, month - 1), 1);
  return { year: prev.getFullYear(), month: prev.getMonth() + 1 };
}

export function getWeekNumber(dayOfMonth: number, startDay: number = 1): number {
  return Math.ceil(dayOfMonth / 7);
}

export function getMonthDays(year: number, month: number): number[] {
  const days = getDaysInMonth(new Date(year, month - 1));
  return Array.from({ length: days }, (_, i) => i + 1);
}

export function getWeekRanges(year: number, month: number): { start: number; end: number }[] {
  const days = getDaysInMonth(new Date(year, month - 1));
  const ranges: { start: number; end: number }[] = [];

  for (let i = 1; i <= days; i += 7) {
    ranges.push({
      start: i,
      end: Math.min(i + 6, days),
    });
  }

  return ranges;
}

export function getMonthName(month: number): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[month - 1] || '';
}

export function getCurrentYear(): number {
  return new Date().getFullYear();
}

export function getCurrentMonth(): number {
  return new Date().getMonth() + 1;
}

export function getTodayString(): string {
  return formatDateKey(new Date());
}

export { isSameDay, isToday, getDaysInMonth };
