import { Habit, HabitEntry } from '@/types';
import { STORAGE_KEYS, DEFAULT_HABITS } from './constants';
import { generateId } from './calculations';

export function loadHabits(): Habit[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.HABITS);
    if (stored) {
      return JSON.parse(stored);
    }
    const defaults = DEFAULT_HABITS.map((h, i) => ({
      id: generateId(),
      name: h.name,
      category: h.category,
      goalDays: 30,
      sortOrder: h.sortOrder,
      isActive: true,
      createdAt: new Date().toISOString(),
    }));
    saveHabits(defaults);
    return defaults;
  } catch {
    return [];
  }
}

export function saveHabits(habits: Habit[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
}

export function loadEntries(): HabitEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.ENTRIES);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveEntries(entries: HabitEntry[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(entries));
}

export function loadTheme(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.THEME);
    if (stored !== null) return JSON.parse(stored);
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  } catch {
    return false;
  }
}

export function saveTheme(isDark: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.THEME, JSON.stringify(isDark));
}

export function exportData(habits: Habit[], entries: HabitEntry[]): string {
  return JSON.stringify({ habits, entries, exportedAt: new Date().toISOString() }, null, 2);
}

export function importData(jsonStr: string): { habits: Habit[]; entries: HabitEntry[] } {
  const data = JSON.parse(jsonStr);
  if (!data.habits || !data.entries) {
    throw new Error('Invalid data format');
  }
  return { habits: data.habits, entries: data.entries };
}
