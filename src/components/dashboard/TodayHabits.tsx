'use client';

import { useState } from 'react';
import { useHabitStore } from '@/store/habit-store';
import { getActiveHabits, isHabitCompletedOnDate } from '@/lib/calculations';
import { getTodayString } from '@/lib/date-utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, StickyNote } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MoodPicker, moodEmoji } from '@/components/MoodPicker';
import type { HabitEntry } from '@/types';

export function TodayHabits() {
  const { habits, entries, toggleEntry, updateEntryDetails } = useHabitStore();
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [editingMood, setEditingMood] = useState<string | null>(null);

  const activeHabits = getActiveHabits(habits);
  const today = getTodayString();
  const completedCount = activeHabits.filter(h =>
    isHabitCompletedOnDate(entries, h.id, today)
  ).length;

  const entryFor = (habitId: string): HabitEntry | undefined =>
    entries.find(e => e.habitId === habitId && e.date === today);

  const saveNote = (habitId: string) => {
    updateEntryDetails(habitId, today, { notes: noteText.trim() || undefined });
    setEditingNote(null);
    setNoteText('');
  };

  return (
    <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50 dark:border-gray-800">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Today</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {completedCount} of {activeHabits.length} completed
          </p>
        </div>
        <div className="text-xs font-medium text-[#4F6BED] bg-[#EEF0FF] dark:bg-[#4F6BED]/20 px-2.5 py-1 rounded-full">
          {activeHabits.length > 0 ? Math.round((completedCount / activeHabits.length) * 100) : 0}%
        </div>
      </div>

      <div className="divide-y divide-gray-50 dark:divide-gray-800 max-h-[400px] overflow-y-auto">
        <AnimatePresence>
          {activeHabits.map((habit, i) => {
            const completed = isHabitCompletedOnDate(entries, habit.id, today);
            const entry = entryFor(habit.id);
            const mood = moodEmoji(entry?.mood);
            const isEditingNote = editingNote === habit.id;

            return (
              <div key={habit.id}>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-150 group"
                >
                  {/* Toggle checkbox */}
                  <button
                    onClick={() => toggleEntry(habit.id, today)}
                    className={cn(
                      'w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0',
                      completed
                        ? 'bg-[#22C55E] border-[#22C55E]'
                        : 'border-gray-300 dark:border-gray-600 group-hover:border-[#4F6BED]'
                    )}
                  >
                    {completed && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      >
                        <Check className="w-3 h-3 text-white" strokeWidth={3} />
                      </motion.div>
                    )}
                  </button>

                  {/* Name */}
                  <span
                    className={cn(
                      'text-sm font-medium text-left flex-1 transition-colors duration-200',
                      completed
                        ? 'text-gray-400 dark:text-gray-500 line-through'
                        : 'text-gray-700 dark:text-gray-200'
                    )}
                  >
                    {habit.name}
                  </span>

                  {/* Mood emoji (completed only) */}
                  {completed && (
                    <div className="flex items-center gap-1">
                      {editingMood === habit.id ? (
                        <div className="flex items-center gap-0.5 bg-gray-50 dark:bg-gray-800 rounded-lg px-1.5 py-0.5">
                          <MoodPicker
                            value={entry?.mood}
                            onChange={(m) => {
                              updateEntryDetails(habit.id, today, { mood: m });
                              setEditingMood(null);
                            }}
                          />
                        </div>
                      ) : (
                        <button
                          onClick={() => setEditingMood(editingMood === habit.id ? null : habit.id)}
                          className={cn(
                            'text-base leading-none transition-all hover:scale-110',
                            entry?.mood ? '' : 'opacity-30 grayscale hover:opacity-60'
                          )}
                          title="Set mood"
                        >
                          {mood || '😐'}
                        </button>
                      )}

                      {/* Note toggle */}
                      <button
                        onClick={() => {
                          if (editingNote === habit.id) { setEditingNote(null); return; }
                          setEditingNote(habit.id);
                          setNoteText(entry?.notes || '');
                          setEditingMood(null);
                        }}
                        className={cn(
                          'p-1 rounded-md transition-colors',
                          entry?.notes
                            ? 'text-[#4F6BED]'
                            : 'text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400'
                        )}
                        title="Add note"
                      >
                        <StickyNote className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  <span className="text-[11px] text-gray-400 dark:text-gray-500 capitalize">
                    {habit.category}
                  </span>
                </motion.div>

                {/* Inline note editor */}
                <AnimatePresence>
                  {isEditingNote && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="px-5 pb-3 overflow-hidden"
                    >
                      <div className="flex gap-2 pl-8">
                        <input
                          type="text"
                          value={noteText}
                          onChange={(e) => setNoteText(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') saveNote(habit.id); if (e.key === 'Escape') setEditingNote(null); }}
                          placeholder="Add a note..."
                          autoFocus
                          className="flex-1 px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4F6BED]/50"
                        />
                        <button
                          onClick={() => saveNote(habit.id)}
                          className="px-3 py-1.5 bg-[#4F6BED] text-white text-xs font-medium rounded-lg hover:bg-[#3D57D9] transition-colors"
                        >
                          Save
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
