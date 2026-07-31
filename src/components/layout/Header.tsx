'use client';

import { useHabitStore } from '@/store/habit-store';
import { useAuth } from '@/hooks/use-auth';
import { getMonthName } from '@/lib/date-utils';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Header() {
  const { currentYear, currentMonth, nextMonth, prevMonth, viewMode } = useHabitStore();
  const { user, isConfigured } = useAuth();

  const pageTitle: Record<string, string> = {
    dashboard: 'Dashboard',
    habits: 'Habits',
    calendar: 'Calendar',
    analytics: 'Analytics',
    settings: 'Settings',
    achievements: 'Achievements',
    review: 'Weekly Review',
    heatmap: 'Heatmap',
    insights: 'AI Insights',
  };

  return (
    <header className="sticky top-0 z-20 bg-white/80 dark:bg-[#111111]/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 lg:ml-[260px]">
      <div className="flex items-center justify-between h-16 px-6 lg:px-8">
        {/* Left: page title + month nav */}
        <div className="flex items-center gap-6">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white tracking-tight hidden sm:block">
            {pageTitle[viewMode] || 'Dashboard'}
          </h1>

          {/* Month navigator */}
          <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-800/50 rounded-lg px-1 py-1">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-md hover:bg-white dark:hover:bg-gray-700 transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>

            <div className="flex items-center gap-2 px-3 py-1">
              <Calendar className="w-4 h-4 text-[#4F6BED]" />
              <span className="text-sm font-semibold text-gray-900 dark:text-white min-w-[120px] text-center">
                {getMonthName(currentMonth)} {currentYear}
              </span>
            </div>

            <button
              onClick={nextMonth}
              className="p-1.5 rounded-md hover:bg-white dark:hover:bg-gray-700 transition-colors"
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>

        {/* Right: today indicator + user badge */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <div className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
            Today
          </div>
          {isConfigured && user && (
            <div className="w-8 h-8 rounded-full bg-[#4F6BED] flex items-center justify-center" title={user.email || ''}>
              <span className="text-xs font-semibold text-white">
                {user.email?.charAt(0).toUpperCase() || '?'}
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
