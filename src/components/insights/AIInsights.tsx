'use client';

import { useMemo, useState } from 'react';
import { useHabitStore } from '@/store/habit-store';
import { getActiveHabits, getEntriesForMonth } from '@/lib/calculations';
import { generateInsights } from '@/lib/insights';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Brain, Sparkles, AlertTriangle, TrendingUp, Zap, Lightbulb, Check, ArrowRight } from 'lucide-react';
import type { AIInsight } from '@/types';

export function AIInsights() {
  const { habits, entries, currentYear, currentMonth, reorderHabits } = useHabitStore();
  const activeHabits = getActiveHabits(habits);
  const monthEntries = getEntriesForMonth(entries, currentYear, currentMonth);
  const [applied, setApplied] = useState<Set<string>>(new Set());

  const insights = useMemo(
    () => generateInsights(habits, entries, currentYear, currentMonth),
    [habits, entries, currentYear, currentMonth]
  );

  // Apply an insight's action: move the suggested habits to the top
  const handleApply = (insight: AIInsight) => {
    if (!insight.action || applied.has(insight.id)) return;
    const { habitIds } = insight.action;
    // Put the anchor habits first, then the rest in their current order
    const anchorIds = habitIds.filter(id => activeHabits.some(h => h.id === id));
    const rest = activeHabits.filter(h => !anchorIds.includes(h.id)).map(h => h.id);
    reorderHabits([...anchorIds, ...rest]);
    setApplied(prev => new Set(prev).add(insight.id));
  };

  const typeConfig: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
    pattern: { icon: TrendingUp, color: '#4F6BED', bg: '#EEF0FF', label: 'Pattern' },
    prediction: { icon: Zap, color: '#F59E0B', bg: '#FEF3C7', label: 'Prediction' },
    recommendation: { icon: Lightbulb, color: '#22C55E', bg: '#DCFCE7', label: 'Recommendation' },
    correlation: { icon: Sparkles, color: '#8B5CF6', bg: '#F3E8FF', label: 'Correlation' },
    milestone: { icon: AlertTriangle, color: '#EC4899', bg: '#FCE7F3', label: 'Milestone' },
  };

  const priorityConfig: Record<string, { border: string; badge: string }> = {
    high: { border: 'border-l-[#EF4444]', badge: 'bg-[#EF4444]/10 text-[#EF4444]' },
    medium: { border: 'border-l-[#F59E0B]', badge: 'bg-[#F59E0B]/10 text-[#F59E0B]' },
    low: { border: 'border-l-gray-300 dark:border-l-gray-600', badge: 'bg-gray-100 dark:bg-gray-800 text-gray-500' },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#4F6BED] to-[#8B5CF6] flex items-center justify-center">
          <Brain className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">AI Insights</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Smart analysis of your habit patterns
          </p>
        </div>
      </div>

      {insights.length === 0 ? (
        <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-100 dark:border-gray-800 p-8 text-center">
          <Brain className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-sm text-gray-500">Keep tracking habits to unlock AI insights!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {insights.map((insight, i) => {
            const type = typeConfig[insight.type] || typeConfig.recommendation;
            const priority = priorityConfig[insight.priority] || priorityConfig.low;
            const Icon = type.icon;

            return (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={cn(
                  'bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-100 dark:border-gray-800 border-l-4 p-5',
                  priority.border
                )}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: type.bg }}
                  >
                    <Icon className="w-4.5 h-4.5" style={{ color: type.color }} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                        {insight.title}
                      </h4>
                      <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded-full', priority.badge)}>
                        {insight.priority}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                      {insight.description}
                    </p>

                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">
                        {type.label}
                      </span>
                      <span className="text-gray-200 dark:text-gray-700">•</span>
                      <span className="text-[10px] text-gray-400">
                        {Math.round(insight.confidence * 100)}% confidence
                      </span>
                    </div>

                    {/* Actionable insight */}
                    {insight.action && (
                      <button
                        onClick={() => handleApply(insight)}
                        disabled={applied.has(insight.id)}
                        className={cn(
                          'mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150',
                          applied.has(insight.id)
                            ? 'bg-[#22C55E]/10 text-[#22C55E] cursor-default'
                            : 'bg-[#4F6BED] text-white hover:bg-[#3D57D9]'
                        )}
                      >
                        {applied.has(insight.id) ? (
                          <>
                            <Check className="w-3 h-3" />
                            {insight.action.appliedLabel}
                          </>
                        ) : (
                          <>
                            {insight.action.label}
                            <ArrowRight className="w-3 h-3" />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* AI Summary */}
      {insights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-[#4F6BED]/5 to-[#8B5CF6]/5 dark:from-[#4F6BED]/10 dark:to-[#8B5CF6]/10 rounded-xl border border-[#4F6BED]/20 p-5"
        >
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-[#4F6BED] mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                AI Summary
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                You have {insights.filter(i => i.priority === 'high').length} high-priority insights.
                {insights.some(i => i.type === 'prediction' && i.priority === 'high')
                  ? ' Pay attention to predictions to maintain your streak.'
                  : ' Your patterns look stable. Keep building on your strengths!'}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
