'use client';

import { useEffect, useState } from 'react';
import { useHabitStore } from '@/store/habit-store';
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
import { SocialView } from '@/components/views/SocialView';
import { InsightsView } from '@/components/views/InsightsView';
import { cn } from '@/lib/utils';

export function AppShell() {
  const [mounted, setMounted] = useState(false);
  const viewMode = useHabitStore(s => s.viewMode);
  const initialize = useHabitStore(s => s.initialize);

  useEffect(() => {
    try {
      initialize();
    } catch (e) {
      console.error('Init error:', e);
    }
    setMounted(true);
  }, []);

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
      case 'social': return <SocialView />;
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
