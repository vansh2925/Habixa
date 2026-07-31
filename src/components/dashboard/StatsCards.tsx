'use client';

import { useEffect, useRef, useState } from 'react';
import { useHabitStore } from '@/store/habit-store';
import { calculateDashboardData } from '@/lib/calculations';
import { getActiveHabits, getEntriesForMonth } from '@/lib/calculations';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Target, TrendingUp, Flame, ShieldCheck, X } from 'lucide-react';

// localStorage key that remembers the last freeze count we showed the user
const FREEZE_SEEN_KEY = 'habitflow-freeze-seen';

export function StatsCards() {
  const { habits, entries, currentYear, currentMonth } = useHabitStore();
  const activeHabits = getActiveHabits(habits);
  const monthEntries = getEntriesForMonth(entries, currentYear, currentMonth);
  const data = calculateDashboardData(monthEntries, activeHabits, currentYear, currentMonth);

  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Detect when a streak was forgiven since the last visit → show a proactive toast
  useEffect(() => {
    if (data.frozenUsed <= 0) return;
    let lastSeen = 0;
    try {
      lastSeen = parseInt(localStorage.getItem(FREEZE_SEEN_KEY) || '0', 10) || 0;
    } catch { /* ignore */ }

    if (data.frozenUsed > lastSeen) {
      setToast(`Streak saved — ${data.frozenUsed} freeze${data.frozenUsed > 1 ? 's' : ''} used this week. You didn't lose momentum!`);
      toastTimer.current = setTimeout(() => setToast(null), 6000);
    }

    // Record what we've now shown
    try { localStorage.setItem(FREEZE_SEEN_KEY, String(data.frozenUsed)); } catch { /* ignore */ }

    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, [data.frozenUsed]);

  const dismissToast = () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(null);
  };

  const cards: {
    label: string; value: string | number; subtext: string;
    icon: React.ElementType; color: string; bgColor: string; forgiveness?: boolean;
  }[] = [
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
      label: 'Current Streak',
      value: `${data.currentStreak}d`,
      subtext: data.frozenUsed > 0
        ? `${data.frozenUsed} freeze used · 7-day ${Math.round(data.sevenDayConsistency * 100)}%`
        : `7-day consistency ${Math.round(data.sevenDayConsistency * 100)}%`,
      icon: Flame,
      color: '#EF4444',
      bgColor: '#FEE2E2',
      forgiveness: data.frozenUsed > 0,
    },
  ];

  return (
    <>
      {/* Streak-saved toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-[60] flex items-center gap-3 bg-[#22C55E]/10 border border-[#22C55E]/30 backdrop-blur-xl rounded-xl px-4 py-3 shadow-lg max-w-sm"
          >
            <div className="w-9 h-9 rounded-full bg-[#22C55E]/15 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5 text-[#22C55E]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Streak saved</p>
              <p className="text-xs text-gray-600 dark:text-gray-300">
                A missed day was forgiven this week. You&apos;re still going strong — keep it up! 🔥
              </p>
            </div>
            <button onClick={dismissToast} className="p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

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
            <div className="flex items-center gap-1.5">
              <div className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                {card.value}
              </div>
              {/* Forgiveness disclosure on the streak card */}
              {card.forgiveness && (
                <span
                  className="text-sm text-gray-300 dark:text-gray-600 cursor-help"
                  title="This streak includes streak freezes — a few missed days don't break it. Full details in the streak card subtext."
                >
                  *
                </span>
              )}
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
    </>
  );
}
