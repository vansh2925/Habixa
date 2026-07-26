'use client';

import { useHabitStore } from '@/store/habit-store';
import { useAuth } from '@/hooks/use-auth';
import { ViewMode } from '@/types';
import {
  LayoutDashboard,
  CalendarDays,
  BarChart3,
  ListChecks,
  Settings,
  Moon,
  Sun,
  Menu,
  X,
  Flame,
  Trophy,
  CalendarCheck,
  Grid3x3,
  Users,
  Brain,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navGroups = [
  {
    label: 'Main',
    items: [
      { mode: 'dashboard' as ViewMode, icon: LayoutDashboard, label: 'Dashboard' },
      { mode: 'habits' as ViewMode, icon: ListChecks, label: 'Habits' },
      { mode: 'calendar' as ViewMode, icon: CalendarDays, label: 'Calendar' },
    ],
  },
  {
    label: 'Insights',
    items: [
      { mode: 'analytics' as ViewMode, icon: BarChart3, label: 'Analytics' },
      { mode: 'heatmap' as ViewMode, icon: Grid3x3, label: 'Heatmap' },
      { mode: 'review' as ViewMode, icon: CalendarCheck, label: 'Weekly Review' },
      { mode: 'insights' as ViewMode, icon: Brain, label: 'AI Insights' },
    ],
  },
  {
    label: 'Motivation',
    items: [
      { mode: 'achievements' as ViewMode, icon: Trophy, label: 'Achievements' },
      { mode: 'social' as ViewMode, icon: Users, label: 'Accountability' },
    ],
  },
];

export function Sidebar() {
  const { viewMode, setViewMode, isDark, toggleDark, sidebarOpen, setSidebarOpen } = useHabitStore();
  const { user, isConfigured, signOut } = useAuth();

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 h-full z-50 flex flex-col',
          'bg-white dark:bg-[#111111] border-r border-gray-100 dark:border-gray-800',
          'w-[260px] transition-transform duration-300 ease-out overflow-y-auto',
          'lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#4F6BED] flex items-center justify-center">
              <Flame className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="font-semibold text-[15px] text-gray-900 dark:text-white tracking-tight">
              HabiXa
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Navigation groups */}
        <nav className="flex-1 px-3 py-4 space-y-5">
          {navGroups.map(group => (
            <div key={group.label}>
              <div className="px-3 mb-1.5 text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                {group.label}
              </div>
              <div className="space-y-0.5">
                {group.items.map(({ mode, icon: Icon, label }) => (
                  <button
                    key={mode}
                    onClick={() => {
                      setViewMode(mode);
                      if (window.innerWidth < 1024) setSidebarOpen(false);
                    }}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150',
                      viewMode === mode
                        ? 'bg-[#4F6BED]/10 text-[#4F6BED]'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white'
                    )}
                  >
                    <Icon className="w-[16px] h-[16px]" strokeWidth={viewMode === mode ? 2.2 : 1.8} />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Theme + Settings */}
        <div className="px-3 pb-4 flex-shrink-0">
          <div className="border-t border-gray-100 dark:border-gray-800 pt-3 space-y-0.5">
            {/* User profile */}
            {isConfigured && user && (
              <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
                <div className="w-8 h-8 rounded-full bg-[#4F6BED]/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-semibold text-[#4F6BED]">
                    {user.email?.charAt(0).toUpperCase() || '?'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                    {user.email}
                  </p>
                </div>
                <button
                  onClick={signOut}
                  className="p-1.5 rounded-md text-gray-400 hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <button
              onClick={() => {
                setViewMode('settings');
                if (window.innerWidth < 1024) setSidebarOpen(false);
              }}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150',
                viewMode === 'settings'
                  ? 'bg-[#4F6BED]/10 text-[#4F6BED]'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white'
              )}
            >
              <Settings className="w-[16px] h-[16px]" strokeWidth={1.8} />
              Settings
            </button>
            <button
              onClick={toggleDark}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white transition-all duration-150"
            >
              {isDark ? (
                <Sun className="w-[16px] h-[16px]" strokeWidth={1.8} />
              ) : (
                <Moon className="w-[16px] h-[16px]" strokeWidth={1.8} />
              )}
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed top-4 left-4 z-30 lg:hidden p-2 rounded-lg bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-700 shadow-sm"
      >
        <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
      </button>
    </>
  );
}
