'use client';

import { StatsCards } from '@/components/dashboard/StatsCards';
import { TodayHabits } from '@/components/dashboard/TodayHabits';
import { WeeklySummary } from '@/components/dashboard/WeeklySummary';
import { MonthlyProgress } from '@/components/dashboard/MonthlyProgress';
import { Leaderboard } from '@/components/dashboard/Leaderboard';
import { DailyChart } from '@/components/dashboard/DailyChart';
import { MissReasonPrompt } from '@/components/MissReasonPrompt';
import { motion } from 'framer-motion';

export function DashboardView() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <MissReasonPrompt />
      <StatsCards />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <TodayHabits />
          <DailyChart />
        </div>
        <div className="space-y-6">
          <MonthlyProgress />
          <WeeklySummary />
        </div>
      </div>
      <Leaderboard />
    </motion.div>
  );
}
