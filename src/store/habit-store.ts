import { create } from 'zustand';
import { Habit, HabitEntry, ViewMode } from '@/types';
import { loadHabits, saveHabits, loadEntries, saveEntries, loadTheme, saveTheme } from '@/lib/storage';
import { generateId } from '@/lib/calculations';
import { getCurrentYear, getCurrentMonth } from '@/lib/date-utils';
import { buildSchedule } from '@/lib/schedule';
import { isSupabaseConfigured, createClient } from '@/lib/supabase/client';
import { fetchHabits, upsertHabits, deleteHabit as deleteHabitDb, fetchEntries, upsertEntries, deleteEntriesByHabit } from '@/lib/supabase/data';

interface HabitStore {
  habits: Habit[];
  entries: HabitEntry[];
  currentYear: number;
  currentMonth: number;
  viewMode: ViewMode;
  isDark: boolean;
  isLoaded: boolean;
  sidebarOpen: boolean;

  setViewMode: (mode: ViewMode) => void;
  setMonth: (year: number, month: number) => void;
  nextMonth: () => void;
  prevMonth: () => void;
  toggleDark: () => void;
  setSidebarOpen: (open: boolean) => void;

  addHabit: (name: string, category?: string, goalDays?: number, scheduleType?: import('@/types').ScheduleType, scheduleDays?: number[], timesPerWeek?: number) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  toggleHabitActive: (id: string) => void;
  reorderHabits: (ids: string[]) => void;

  toggleEntry: (habitId: string, date: string) => void;
  bulkToggle: (habitId: string, dates: string[], completed: boolean) => void;
  updateEntryDetails: (habitId: string, date: string, details: { mood?: number; notes?: string }) => void;
  setMissReason: (habitId: string, date: string, reason: string) => void;

  initialize: () => void;
  syncFromCloud: () => Promise<void>;
  exportAllData: () => string;
  importAllData: (json: string) => void;
  resetData: () => void;
}

// Helper: get current user ID
async function getUserId(): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    return data.user?.id || null;
  } catch {
    return null;
  }
}

// Helper: sync habits to cloud (fire and forget)
async function syncHabits(habits: Habit[]) {
  const userId = await getUserId();
  if (!userId) return;
  upsertHabits(userId, habits).catch(console.error);
}

// Helper: sync entries to cloud (fire and forget)
async function syncEntries(entries: HabitEntry[]) {
  const userId = await getUserId();
  if (!userId) return;
  upsertEntries(userId, entries).catch(console.error);
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

  addHabit: (name, category = 'general', goalDays, scheduleType = 'daily', scheduleDays = [], timesPerWeek = 3) => {
    const { habits } = get();
    const maxOrder = habits.reduce((max, h) => Math.max(max, h.sortOrder), 0);
    const schedule = buildSchedule(scheduleType, scheduleDays, timesPerWeek);
    const newHabit: Habit = {
      id: generateId(),
      name,
      category,
      goalDays: goalDays ?? 30,
      sortOrder: maxOrder + 1,
      isActive: true,
      createdAt: new Date().toISOString(),
      scheduleType: schedule.scheduleType,
      scheduleDays: schedule.scheduleDays,
      timesPerWeek: schedule.timesPerWeek,
    };
    const updated = [...habits, newHabit];
    set({ habits: updated });
    saveHabits(updated);
    syncHabits(updated);
  },

  updateHabit: (id, updates) => {
    const { habits } = get();
    const updated = habits.map(h => h.id === id ? { ...h, ...updates } : h);
    set({ habits: updated });
    saveHabits(updated);
    syncHabits(updated);
  },

  deleteHabit: (id) => {
    const { habits, entries } = get();
    const updatedHabits = habits.filter(h => h.id !== id);
    const updatedEntries = entries.filter(e => e.habitId !== id);
    set({ habits: updatedHabits, entries: updatedEntries });
    saveHabits(updatedHabits);
    saveEntries(updatedEntries);
    // Delete from cloud
    const userId = getUserId();
    userId.then(uid => {
      if (uid) {
        deleteHabitDb(id);
        deleteEntriesByHabit(id);
      }
    });
    syncHabits(updatedHabits);
  },

  toggleHabitActive: (id) => {
    const { habits } = get();
    const updated = habits.map(h => h.id === id ? { ...h, isActive: !h.isActive } : h);
    set({ habits: updated });
    saveHabits(updated);
    syncHabits(updated);
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
    syncHabits(updated);
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
    syncEntries(updated);
  },

  updateEntryDetails: (habitId, date, details) => {
    const { entries } = get();
    let updated = [...entries];
    const existing = updated.find(e => e.habitId === habitId && e.date === date);

    if (existing) {
      updated = updated.map(e =>
        e.habitId === habitId && e.date === date ? { ...e, ...details } : e
      );
    } else {
      // No entry yet — create a completed entry with the details
      updated.push({
        id: generateId(),
        habitId,
        date,
        completed: true,
        completedAt: new Date().toISOString(),
        ...details,
      });
    }

    set({ entries: updated });
    saveEntries(updated);
    syncEntries(updated);
  },

  setMissReason: (habitId, date, reason) => {
    const { entries } = get();
    let updated = [...entries];
    const existing = updated.find(e => e.habitId === habitId && e.date === date);

    if (existing) {
      updated = updated.map(e =>
        e.habitId === habitId && e.date === date
          ? { ...e, missedReason: reason, completed: false }
          : e
      );
    } else {
      updated.push({
        id: generateId(),
        habitId,
        date,
        completed: false,
        missedReason: reason,
      });
    }

    set({ entries: updated });
    saveEntries(updated);
    syncEntries(updated);
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
    syncEntries(updated);
  },

  initialize: () => {
    // Always load from localStorage first (instant)
    const habits = loadHabits();
    const entries = loadEntries();
    const isDark = loadTheme();

    if (isDark) {
      document.documentElement.classList.add('dark');
    }

    set({ habits, entries, isDark, isLoaded: true });

    // Then try to load from cloud (async, overwrites localStorage if cloud has data)
    get().syncFromCloud();
  },

  syncFromCloud: async () => {
    const userId = await getUserId();
    if (!userId) return;

    try {
      const [cloudHabits, cloudEntries] = await Promise.all([
        fetchHabits(userId),
        fetchEntries(userId),
      ]);

      if (cloudHabits.length > 0 || cloudEntries.length > 0) {
        // Cloud has data — use it
        set({ habits: cloudHabits, entries: cloudEntries });
        saveHabits(cloudHabits);
        saveEntries(cloudEntries);
      } else {
        // Cloud is empty — push localStorage data up
        const { habits, entries } = get();
        if (habits.length > 0) syncHabits(habits);
        if (entries.length > 0) syncEntries(entries);
      }
    } catch (e) {
      console.error('syncFromCloud error:', e);
    }
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
      syncHabits(data.habits);
      syncEntries(data.entries);
    }
  },

  resetData: () => {
    set({ habits: [], entries: [] });
    saveHabits([]);
    saveEntries([]);
    syncHabits([]);
    syncEntries([]);
  },
}));
