'use client';

import { useHabitStore } from '@/store/habit-store';
import { calculateDashboardData } from '@/lib/calculations';
import { getActiveHabits, getEntriesForMonth } from '@/lib/calculations';
import { motion } from 'framer-motion';
import { CheckCircle2, Target, TrendingUp, Flame } from 'lucide-react';

export function StatsCards() {
  const { habits, entries, currentYear, currentMonth } = useHabitStore();
  const activeHabits = getActiveHabits(habits);
  const monthEntries = getEntriesForMonth(entries, currentYear, currentMonth);
  const data = calculateDashboardData(monthEntries, activeHabits, currentYear, currentMonth);

  const cards = [
    {
      label: 'Completed',
      value: data.monthlyCompleted,
      subtext: `of ${data.monthlyGoal} total`,
      icon: CheckCircle2,
      color: '#22C55E',
      bgColor: '#DCFCE7',
    },
    {
      label: 'Success Rate',
      value: `${Math.round(data.monthlyPercentage * 100)}%`,
      subtext: 'monthly progress',
      icon: TrendingUp,
      color: '#4F6BED',
      bgColor: '#EEF0FF',
    },
    {
      label: 'Remaining',
      value: data.monthlyRemaining,
      subtext: 'habits left',
      icon: Target,
      color: '#F59E0B',
      bgColor: '#FEF3C7',
    },
    {
      label: 'Best Streak',
      value: `${data.longestStreak}d`,
      subtext: 'consecutive days',
      icon: Flame,
      color: '#EF4444',
      bgColor: '#FEE2E2',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05, duration: 0.3 }}
          className="bg-white dark:bg-[#1a1a1a] rounded-xl p-5 border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex items-start justify-between mb-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: card.bgColor }}
            >
              <card.icon className="w-[18px] h-[18px]" style={{ color: card.color }} />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            {card.value}
          </div>
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-0.5">
            {card.label}
          </div>
          <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            {card.subtext}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
