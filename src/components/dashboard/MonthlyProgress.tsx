'use client';

import { useHabitStore } from '@/store/habit-store';
import { getActiveHabits, getEntriesForMonth } from '@/lib/calculations';
import { calculateDashboardData } from '@/lib/calculations';
import { motion } from 'framer-motion';

export function MonthlyProgress() {
  const { habits, entries, currentYear, currentMonth } = useHabitStore();
  const activeHabits = getActiveHabits(habits);
  const monthEntries = getEntriesForMonth(entries, currentYear, currentMonth);
  const data = calculateDashboardData(monthEntries, activeHabits, currentYear, currentMonth);

  const percentage = data.monthlyPercentage;
  const radius = 60;
  const stroke = 8;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - percentage * circumference;

  return (
    <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-100 dark:border-gray-800 p-5 flex flex-col items-center">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 self-start">
        Monthly Overview
      </h3>

      <div className="relative">
        <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            stroke="#E5E7EB"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className="dark:opacity-20"
          />
          {/* Progress circle */}
          <motion.circle
            stroke="#4F6BED"
            fill="transparent"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            {Math.round(percentage * 100)}%
          </span>
          <span className="text-[11px] text-gray-500 dark:text-gray-400">
            overall
          </span>
        </div>
      </div>

      <div className="flex items-center gap-6 mt-4">
        <div className="text-center">
          <div className="text-lg font-bold text-[#22C55E]">{data.monthlyCompleted}</div>
          <div className="text-[11px] text-gray-500">Done</div>
        </div>
        <div className="w-px h-8 bg-gray-100 dark:bg-gray-800" />
        <div className="text-center">
          <div className="text-lg font-bold text-[#F59E0B]">{data.monthlyRemaining}</div>
          <div className="text-[11px] text-gray-500">Left</div>
        </div>
        <div className="w-px h-8 bg-gray-100 dark:bg-gray-800" />
        <div className="text-center">
          <div className="text-lg font-bold text-gray-900 dark:text-white">{data.monthlyGoal}</div>
          <div className="text-[11px] text-gray-500">Target</div>
        </div>
      </div>
    </div>
  );
}
