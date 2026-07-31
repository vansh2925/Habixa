'use client';

import { useState, useEffect } from 'react';
import { Habit } from '@/types';
import { CATEGORIES } from '@/lib/constants';
import { SchedulePicker, ScheduleValue } from './SchedulePicker';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface EditHabitModalProps {
  habit: Habit;
  onSave: (id: string, updates: Partial<Habit>) => void;
  onClose: () => void;
}

export function EditHabitModal({ habit, onSave, onClose }: EditHabitModalProps) {
  const [name, setName] = useState(habit.name);
  const [category, setCategory] = useState(habit.category);
  const [goal, setGoal] = useState(habit.goalDays);
  const [schedule, setSchedule] = useState<ScheduleValue>({
    scheduleType: habit.scheduleType ?? 'daily',
    scheduleDays: habit.scheduleDays ?? [],
    timesPerWeek: habit.timesPerWeek ?? 3,
  });

  // Escape to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave(habit.id, {
      name: name.trim(),
      category,
      goalDays: goal,
      scheduleType: schedule.scheduleType,
      scheduleDays: schedule.scheduleDays,
      timesPerWeek: schedule.timesPerWeek,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-[420px] bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              Edit Habit
            </h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1.5">
                Habit name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4F6BED]/50"
                autoFocus
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4F6BED]/50"
              >
                {CATEGORIES.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1.5">
                How often?
              </label>
              <SchedulePicker value={schedule} onChange={setSchedule} />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1.5">
                Goal (days)
              </label>
              <input
                type="number"
                value={goal}
                onChange={(e) => setGoal(Number(e.target.value))}
                min={1}
                max={31}
                className="w-20 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4F6BED]/50"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-2 mt-5">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!name.trim()}
              className={cn(
                'flex-1 px-4 py-2.5 bg-[#4F6BED] text-white text-sm font-semibold rounded-lg hover:bg-[#3D57D9] transition-colors',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              Save Changes
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
