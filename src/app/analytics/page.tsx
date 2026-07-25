'use client';

import { AppShell } from '@/components/layout/AppShell';
import { useEffect } from 'react';
import { useHabitStore } from '@/store/habit-store';

export default function AnalyticsPage() {
  const setViewMode = useHabitStore(s => s.setViewMode);
  useEffect(() => { setViewMode('analytics'); }, [setViewMode]);
  return <AppShell />;
}
