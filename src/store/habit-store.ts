import { create } from 'zustand';
import { Habit, HabitEntry, ViewMode } from '@/types';
import { loadHabits, saveHabits, loadEntries, saveEntries, loadTheme, saveTheme } from '@/lib/storage';
import { generateId } from '@/lib/calculations';
import { getCurrentYear, getCurrentMonth } from '@/lib/date-utils';

interface HabitStore {
  // State
  habits: Habit[];
  entries: HabitEntry[];
  currentYear: number;
  currentMonth: number;
  viewMode: ViewMode;
  isDark: boolean;
  isLoaded: boolean;
  sidebarOpen: boolean;

  // Actions
  setViewMode: (mode: ViewMode) => void;
  setMonth: (year: number, month: number) => void;
  nextMonth: () => void;
  prevMonth: () => void;
  toggleDark: () => void;
  setSidebarOpen: (open: boolean) => void;

  // Habit CRUD
  addHabit: (name: string, category?: string, goalDays?: number) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  toggleHabitActive: (id: string) => void;
  reorderHabits: (ids: string[]) => void;

  // Entry actions
  toggleEntry: (habitId: string, date: string) => void;
  bulkToggle: (habitId: string, dates: string[], completed: boolean) => void;

  // Data management
  initialize: () => void;
  exportAllData: () => string;
  importAllData: (json: string) => void;
  resetData: () => void;
}

export const useHabitStore = create<HabitStore>((set, get) => ({
  habits: [],
  entries: [],
  currentYear: getCurrentYear(),
  currentMonth: getCurrentMonth(),
  viewMode: 'dashboard',
  isDark: false,
  isLoaded: false,
  sidebarOpen: true,

  setViewMode: (mode) => set({ viewMode: mode }),

  setMonth: (year, month) => set({ currentYear: year, currentMonth: month }),

  nextMonth: () => {
    const { currentYear, currentMonth } = get();
    if (currentMonth === 12) {
      set({ currentYear: currentYear + 1, currentMonth: 1 });
    } else {
      set({ currentMonth: currentMonth + 1 });
    }
  },

  prevMonth: () => {
    const { currentYear, currentMonth } = get();
    if (currentMonth === 1) {
      set({ currentYear: currentYear - 1, currentMonth: 12 });
    } else {
      set({ currentMonth: currentMonth - 1 });
    }
  },

  toggleDark: () => {
    const newDark = !get().isDark;
    set({ isDark: newDark });
    saveTheme(newDark);
    if (newDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },

  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  addHabit: (name, category = 'general', goalDays = 30) => {
    const { habits } = get();
    const maxOrder = habits.reduce((max, h) => Math.max(max, h.sortOrder), 0);
    const newHabit: Habit = {
      id: generateId(),
      name,
      category,
      goalDays,
      sortOrder: maxOrder + 1,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    const updated = [...habits, newHabit];
    set({ habits: updated });
    saveHabits(updated);
  },

  updateHabit: (id, updates) => {
    const { habits } = get();
    const updated = habits.map(h => h.id === id ? { ...h, ...updates } : h);
    set({ habits: updated });
    saveHabits(updated);
  },

  deleteHabit: (id) => {
    const { habits, entries } = get();
    const updatedHabits = habits.filter(h => h.id !== id);
    const updatedEntries = entries.filter(e => e.habitId !== id);
    set({ habits: updatedHabits, entries: updatedEntries });
    saveHabits(updatedHabits);
    saveEntries(updatedEntries);
  },

  toggleHabitActive: (id) => {
    const { habits } = get();
    const updated = habits.map(h => h.id === id ? { ...h, isActive: !h.isActive } : h);
    set({ habits: updated });
    saveHabits(updated);
  },

  reorderHabits: (ids) => {
    const { habits } = get();
    const habitMap = new Map(habits.map(h => [h.id, h]));
    const updated = ids.map((id, index) => {
      const habit = habitMap.get(id);
      if (habit) return { ...habit, sortOrder: index + 1 };
      return null;
    }).filter(Boolean) as Habit[];
    set({ habits: updated });
    saveHabits(updated);
  },

  toggleEntry: (habitId, date) => {
    const { entries } = get();
    const existing = entries.find(e => e.habitId === habitId && e.date === date);

    let updated: HabitEntry[];
    if (existing) {
      updated = entries.map(e =>
        e.habitId === habitId && e.date === date
          ? { ...e, completed: !e.completed, completedAt: !e.completed ? new Date().toISOString() : undefined }
          : e
      );
    } else {
      const newEntry: HabitEntry = {
        id: generateId(),
        habitId,
        date,
        completed: true,
        completedAt: new Date().toISOString(),
      };
      updated = [...entries, newEntry];
    }

    set({ entries: updated });
    saveEntries(updated);
  },

  bulkToggle: (habitId, dates, completed) => {
    const { entries } = get();
    let updated = [...entries];

    dates.forEach(date => {
      const existing = updated.find(e => e.habitId === habitId && e.date === date);
      if (existing) {
        updated = updated.map(e =>
          e.habitId === habitId && e.date === date
            ? { ...e, completed, completedAt: completed ? new Date().toISOString() : undefined }
            : e
        );
      } else if (completed) {
        updated.push({
          id: generateId(),
          habitId,
          date,
          completed: true,
          completedAt: new Date().toISOString(),
        });
      }
    });

    set({ entries: updated });
    saveEntries(updated);
  },

  initialize: () => {
    const habits = loadHabits();
    const entries = loadEntries();
    const isDark = loadTheme();

    if (isDark) {
      document.documentElement.classList.add('dark');
    }

    set({ habits, entries, isDark, isLoaded: true });
  },

  exportAllData: () => {
    const { habits, entries } = get();
    return JSON.stringify({ habits, entries, exportedAt: new Date().toISOString() }, null, 2);
  },

  importAllData: (json) => {
    const data = JSON.parse(json);
    if (data.habits && data.entries) {
      set({ habits: data.habits, entries: data.entries });
      saveHabits(data.habits);
      saveEntries(data.entries);
    }
  },

  resetData: () => {
    set({ habits: [], entries: [] });
    saveHabits([]);
    saveEntries([]);
  },
}));
