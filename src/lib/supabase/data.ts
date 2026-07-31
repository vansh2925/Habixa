import { createClient } from './client';
import { Habit, HabitEntry } from '@/types';

// ---- Habits ----

export async function fetchHabits(userId: string): Promise<Habit[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('habits')
    .select('*')
    .eq('user_id', userId)
    .order('sort_order');

  if (error) {
    console.error('fetchHabits error:', error);
    return [];
  }

  return (data || []).map(row => ({
    id: row.id,
    name: row.name,
    description: row.description,
    category: row.category,
    goalDays: row.goal_days,
    sortOrder: row.sort_order,
    isActive: row.is_active,
    createdAt: row.created_at,
    scheduleType: row.schedule_type ?? 'daily',
    scheduleDays: row.schedule_days ?? [],
    timesPerWeek: row.times_per_week ?? 3,
  }));
}

export async function upsertHabits(userId: string, habits: Habit[]): Promise<void> {
  const supabase = createClient();
  const rows = habits.map(h => ({
    id: h.id,
    user_id: userId,
    name: h.name,
    description: h.description || null,
    category: h.category,
    goal_days: h.goalDays,
    sort_order: h.sortOrder,
    is_active: h.isActive,
    created_at: h.createdAt,
    schedule_type: h.scheduleType ?? 'daily',
    schedule_days: h.scheduleDays ?? [],
    times_per_week: h.timesPerWeek ?? 3,
  }));

  const { error } = await supabase
    .from('habits')
    .upsert(rows, { onConflict: 'id' });

  if (error) console.error('upsertHabits error:', error);
}

export async function deleteHabit(habitId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('habits')
    .delete()
    .eq('id', habitId);

  if (error) console.error('deleteHabit error:', error);
}

// ---- Entries ----

export async function fetchEntries(userId: string): Promise<HabitEntry[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('habit_entries')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('fetchEntries error:', error);
    return [];
  }

  return (data || []).map(row => ({
    id: row.id,
    habitId: row.habit_id,
    date: row.date,
    completed: row.completed,
    completedAt: row.completed_at,
    notes: row.notes,
    mood: row.mood,
    missedReason: row.missed_reason,
  }));
}

export async function upsertEntries(userId: string, entries: HabitEntry[]): Promise<void> {
  const supabase = createClient();
  const rows = entries.map(e => ({
    id: e.id,
    user_id: userId,
    habit_id: e.habitId,
    date: e.date,
    completed: e.completed,
    completed_at: e.completedAt || null,
    notes: e.notes || null,
    mood: e.mood ?? null,
    missed_reason: e.missedReason || null,
  }));

  const { error } = await supabase
    .from('habit_entries')
    .upsert(rows, { onConflict: 'id' });

  if (error) console.error('upsertEntries error:', error);
}

export async function deleteEntriesByHabit(habitId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('habit_entries')
    .delete()
    .eq('habit_id', habitId);

  if (error) console.error('deleteEntriesByHabit error:', error);
}
