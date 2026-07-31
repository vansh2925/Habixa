'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useHabitStore } from '@/store/habit-store';
import { useAuth } from '@/hooks/use-auth';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { DashboardView } from '@/components/views/DashboardView';
import { HabitsView } from '@/components/views/HabitsView';
import { CalendarViewWrapper } from '@/components/views/CalendarView';
import { AnalyticsViewWrapper } from '@/components/views/AnalyticsViewWrapper';
import { SettingsViewWrapper } from '@/components/views/SettingsViewWrapper';
import { AchievementsView } from '@/components/views/AchievementsView';
import { ReviewView } from '@/components/views/ReviewView';
import { HeatmapView } from '@/components/views/HeatmapView';
import { InsightsView } from '@/components/views/InsightsView';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export function AppShell() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const viewMode = useHabitStore(s => s.viewMode);
  const initialize = useHabitStore(s => s.initialize);
  const { user, loading: authLoading, isConfigured } = useAuth();

  useEffect(() => {
    try {
      initialize();
    } catch (e) {
      console.error('Init error:', e);
    }
    setMounted(true);
  }, []);

  // Redirect to login if Supabase is configured and user is not authenticated
  useEffect(() => {
    if (isConfigured && !authLoading && !user) {
      router.push('/login');
    }
  }, [isConfigured, authLoading, user, router]);

  // Show loading while auth is resolving
  if (isConfigured && authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] dark:bg-[#0a0a0a]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#4F6BED] flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-white animate-spin" />
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">Loading...</span>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    switch (viewMode) {
      case 'dashboard': return <DashboardView />;
      case 'habits': return <HabitsView />;
      case 'calendar': return <CalendarViewWrapper />;
      case 'analytics': return <AnalyticsViewWrapper />;
      case 'settings': return <SettingsViewWrapper />;
      case 'achievements': return <AchievementsView />;
      case 'review': return <ReviewView />;
      case 'heatmap': return <HeatmapView />;
      case 'insights': return <InsightsView />;
      default: return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0a0a0a]">
      <Sidebar />
      <Header />

      <main
        className={cn(
          'pt-0 transition-all duration-300',
          'lg:ml-[260px]'
        )}
      >
        <div className="p-6 lg:p-8 max-w-[1400px]">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}
