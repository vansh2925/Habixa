'use client';

import { useState } from 'react';
import { useHabitStore } from '@/store/habit-store';
import { getActiveHabits, isHabitCompletedOnDate } from '@/lib/calculations';
import { getDaysInMonth, formatDateKey } from '@/lib/date-utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, GripVertical, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CATEGORIES } from '@/lib/constants';
import { Habit } from '@/types';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Sortable habit row component
function SortableHabitRow({
  habit,
  daysInMonth,
  currentYear,
  currentMonth,
  entries,
  toggleEntry,
  weekRanges,
}: {
  habit: Habit;
  daysInMonth: number;
  currentYear: number;
  currentMonth: number;
  entries: any[];
  toggleEntry: (habitId: string, date: string) => void;
  weekRanges: { start: number; end: number; label: string }[];
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: habit.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  let completedDays = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    if (isHabitCompletedOnDate(entries, habit.id, dateStr)) {
      completedDays++;
    }
  }
  const progress = habit.goalDays > 0 ? completedDays / habit.goalDays : 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors border-b border-gray-50 dark:border-gray-800/50',
        isDragging && 'opacity-50 bg-[#4F6BED]/5 z-50'
      )}
    >
      <div className="flex items-center">
        {/* Drag handle + Habit name */}
        <div className="w-[200px] min-w-[200px] px-4 py-2.5">
          <div className="flex items-center gap-2">
            <button
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 transition-colors flex-shrink-0 touch-none"
              title="Drag to reorder"
            >
              <GripVertical className="w-3.5 h-3.5" />
            </button>
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: CATEGORIES.find(c => c.id === habit.category)?.color || '#6B7280' }}
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">
              {habit.name}
            </span>
          </div>
        </div>

        {/* Day toggles */}
        <div className="flex-1 flex">
          {weekRanges.map((week, wi) => (
            <div key={wi} className="flex-1 border-l border-gray-100 dark:border-gray-800 flex">
              {Array.from({ length: week.end - week.start + 1 }, (_, di) => {
                const day = week.start + di;
                const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const completed = isHabitCompletedOnDate(entries, habit.id, dateStr);
                const isToday = formatDateKey(new Date()) === dateStr;

                return (
                  <button
                    key={day}
                    onClick={() => toggleEntry(habit.id, dateStr)}
                    className={cn(
                      'flex-1 h-8 flex items-center justify-center transition-all duration-150',
                      isToday && 'bg-[#4F6BED]/5',
                      completed
                        ? 'bg-[#22C55E]/10 hover:bg-[#22C55E]/20'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    )}
                  >
                    {completed && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      >
                        <Check className="w-3 h-3 text-[#22C55E]" strokeWidth={3} />
                      </motion.div>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Completion count */}
        <div className="w-[80px] min-w-[80px] px-2 py-2.5 text-center border-l border-gray-100 dark:border-gray-800">
          <span className={cn(
            'text-sm font-semibold',
            progress >= 0.8 ? 'text-[#22C55E]' :
            progress >= 0.5 ? 'text-[#F59E0B]' :
            'text-gray-400'
          )}>
            {completedDays}/{habit.goalDays}
          </span>
        </div>
      </div>
    </div>
  );
}

// Sortable manage row
function SortableManageRow({
  habit,
  toggleHabitActive,
  deleteHabit,
}: {
  habit: Habit;
  toggleHabitActive: (id: string) => void;
  deleteHabit: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `manage-${habit.id}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-3 px-5 py-3 hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors border-b border-gray-50 dark:border-gray-800/50',
        isDragging && 'opacity-50 bg-[#4F6BED]/5 z-50'
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 transition-colors touch-none"
      >
        <GripVertical className="w-3.5 h-3.5" />
      </button>
      <div
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ backgroundColor: CATEGORIES.find(c => c.id === habit.category)?.color || '#6B7280' }}
      />
      <span className={cn(
        'flex-1 text-sm font-medium',
        habit.isActive ? 'text-gray-700 dark:text-gray-200' : 'text-gray-400 dark:text-gray-500'
      )}>
        {habit.name}
      </span>
      <span className="text-xs text-gray-400">{habit.goalDays}d goal</span>
      <button
        onClick={() => toggleHabitActive(habit.id)}
        className={cn(
          'px-2.5 py-1 text-xs font-medium rounded-md transition-colors',
          habit.isActive
            ? 'bg-[#22C55E]/10 text-[#22C55E] hover:bg-[#22C55E]/20'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'
        )}
      >
        {habit.isActive ? 'Active' : 'Inactive'}
      </button>
      <button
        onClick={() => deleteHabit(habit.id)}
        className="p-1.5 rounded-md text-gray-400 hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export function HabitTracker() {
  const { habits, entries, currentYear, currentMonth, toggleEntry, addHabit, deleteHabit, toggleHabitActive, reorderHabits } = useHabitStore();
  const activeHabits = getActiveHabits(habits);
  const daysInMonth = getDaysInMonth(new Date(currentYear, currentMonth - 1));

  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('general');
  const [newGoal, setNewGoal] = useState(daysInMonth);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const weekRanges: { start: number; end: number; label: string }[] = [];
  for (let i = 1; i <= daysInMonth; i += 7) {
    const end = Math.min(i + 6, daysInMonth);
    weekRanges.push({ start: i, end, label: `W${weekRanges.length + 1}` });
  }

  const handleAdd = () => {
    if (newName.trim()) {
      addHabit(newName.trim(), newCategory, newGoal);
      setNewName('');
      setNewCategory('general');
      setNewGoal(daysInMonth);
      setShowAddForm(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = activeHabits.findIndex(h => h.id === active.id);
    const newIndex = activeHabits.findIndex(h => h.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const newOrder = arrayMove(activeHabits, oldIndex, newIndex);
    reorderHabits(newOrder.map(h => h.id));
  };

  const handleManageDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id).replace('manage-', '');
    const overId = String(over.id).replace('manage-', '');
    if (activeId === overId) return;

    const oldIndex = habits.findIndex(h => h.id === activeId);
    const newIndex = habits.findIndex(h => h.id === overId);
    if (oldIndex === -1 || newIndex === -1) return;

    const newOrder = arrayMove(habits, oldIndex, newIndex);
    reorderHabits(newOrder.map(h => h.id));
  };

  return (
    <div className="space-y-4">
      {/* Add habit button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Habit Tracker</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {activeHabits.length} active habits · Drag to reorder
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-[#4F6BED] text-white text-sm font-medium rounded-lg hover:bg-[#3D57D9] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Habit
        </button>
      </div>

      {/* Add habit form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-100 dark:border-gray-800 p-4 overflow-hidden"
          >
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <input
                type="text"
                placeholder="Habit name..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                className="sm:col-span-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4F6BED]/50"
                autoFocus
              />
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4F6BED]/50"
              >
                {CATEGORIES.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={newGoal}
                  onChange={(e) => setNewGoal(Number(e.target.value))}
                  min={1}
                  max={31}
                  className="w-16 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4F6BED]/50"
                />
                <button
                  onClick={handleAdd}
                  className="px-4 py-2 bg-[#22C55E] text-white text-sm font-medium rounded-lg hover:bg-[#16A34A] transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tracker grid with drag and drop */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        {/* Week headers */}
        <div className="flex border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
          <div className="w-[200px] min-w-[200px] px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400">
            Habit
          </div>
          <div className="flex-1 flex">
            {weekRanges.map((week, wi) => (
              <div key={wi} className="flex-1 border-l border-gray-100 dark:border-gray-800">
                <div className="px-1 py-2.5 text-center text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  {week.label}
                </div>
                <div className="flex border-t border-gray-100 dark:border-gray-800">
                  {Array.from({ length: week.end - week.start + 1 }, (_, di) => {
                    const day = week.start + di;
                    return (
                      <div key={day} className="flex-1 text-center py-1 text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                        {day}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <div className="w-[80px] min-w-[80px] px-2 py-2.5 text-center text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-l border-gray-100 dark:border-gray-800">
            Done
          </div>
        </div>

        {/* Habit rows with drag and drop */}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={activeHabits.map(h => h.id)} strategy={verticalListSortingStrategy}>
            {activeHabits.map((habit) => (
              <SortableHabitRow
                key={habit.id}
                habit={habit}
                daysInMonth={daysInMonth}
                currentYear={currentYear}
                currentMonth={currentMonth}
                entries={entries}
                toggleEntry={toggleEntry}
                weekRanges={weekRanges}
              />
            ))}
          </SortableContext>
        </DndContext>

        {activeHabits.length === 0 && (
          <div className="py-12 text-center text-sm text-gray-400">
            No habits yet. Add your first habit to start tracking!
          </div>
        )}
      </div>

      {/* Manage habits with drag and drop */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 dark:border-gray-800">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Manage Habits</h3>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Drag to reorder</p>
        </div>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleManageDragEnd}>
          <SortableContext items={habits.map(h => `manage-${h.id}`)} strategy={verticalListSortingStrategy}>
            {habits.map(habit => (
              <SortableManageRow
                key={habit.id}
                habit={habit}
                toggleHabitActive={toggleHabitActive}
                deleteHabit={deleteHabit}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
