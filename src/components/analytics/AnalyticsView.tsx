'use client';

import { useHabitStore } from '@/store/habit-store';
import { getActiveHabits, getEntriesForMonth, getDailyStats, getWeeklyStats, getHabitStats } from '@/lib/calculations';
import { getDaysInMonth, getMonthName, formatDateKey } from '@/lib/date-utils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line, CartesianGrid, PieChart, Pie } from 'recharts';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { TrendingUp, Target, Calendar, Award } from 'lucide-react';
import { CHART_COLORS } from '@/lib/constants';

export function AnalyticsView() {
  const { habits, entries, currentYear, currentMonth } = useHabitStore();
  const activeHabits = getActiveHabits(habits);
  const monthEntries = getEntriesForMonth(entries, currentYear, currentMonth);
  const dailyStats = getDailyStats(monthEntries, activeHabits, currentYear, currentMonth);
  const weeklyStats = getWeeklyStats(monthEntries, activeHabits, currentYear, currentMonth);
  const habitStats = getHabitStats(monthEntries, activeHabits, currentYear, currentMonth);

  const daysInMonth = getDaysInMonth(new Date(currentYear, currentMonth - 1));

  // Heatmap data
  const heatmapData = dailyStats.map(d => ({
    day: d.day,
    percentage: Math.round(d.percentage * 100),
  }));

  // Habit breakdown for pie chart
  const pieData = habitStats.map((s, i) => ({
    name: s.habitName.length > 15 ? s.habitName.slice(0, 15) + '...' : s.habitName,
    value: s.completed,
    fill: CHART_COLORS[i % CHART_COLORS.length],
  }));

  // Weekly comparison
  const weeklyBarData = weeklyStats.map(w => ({
    week: `W${w.week}`,
    completed: w.completed,
    total: w.total,
    percentage: Math.round(w.percentage * 100),
  }));

  // Best/worst days
  const sortedDays = [...dailyStats].sort((a, b) => b.percentage - a.percentage);
  const bestDays = sortedDays.slice(0, 3);
  const worstDays = sortedDays.filter(d => d.completed > 0).slice(-3).reverse();

  // Consistency score
  const daysWithActivity = dailyStats.filter(d => d.completed > 0).length;
  const consistency = daysInMonth > 0 ? daysWithActivity / daysInMonth : 0;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 shadow-lg">
          <p className="text-xs font-semibold text-gray-900 dark:text-white">{label}</p>
          <p className="text-xs text-gray-500">{payload[0].value} completed</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Analytics</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {getMonthName(currentMonth)} {currentYear} insights
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#1a1a1a] rounded-xl p-4 border border-gray-100 dark:border-gray-800"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-[#22C55E]/10 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-[#22C55E]" />
            </div>
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            {daysWithActivity}/{daysInMonth}
          </div>
          <div className="text-xs text-gray-500">Active days</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white dark:bg-[#1a1a1a] rounded-xl p-4 border border-gray-100 dark:border-gray-800"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-[#4F6BED]/10 flex items-center justify-center">
              <Target className="w-4 h-4 text-[#4F6BED]" />
            </div>
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            {Math.round(consistency * 100)}%
          </div>
          <div className="text-xs text-gray-500">Consistency</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-[#1a1a1a] rounded-xl p-4 border border-gray-100 dark:border-gray-800"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-[#F59E0B]/10 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-[#F59E0B]" />
            </div>
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            {bestDays[0] ? `Day ${bestDays[0].day}` : '—'}
          </div>
          <div className="text-xs text-gray-500">Best day</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white dark:bg-[#1a1a1a] rounded-xl p-4 border border-gray-100 dark:border-gray-800"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-[#8B5CF6]/10 flex items-center justify-center">
              <Award className="w-4 h-4 text-[#8B5CF6]" />
            </div>
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            {bestDays[0] ? `${Math.round(bestDays[0].percentage * 100)}%` : '—'}
          </div>
          <div className="text-xs text-gray-500">Peak performance</div>
        </motion.div>
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily trend */}
        <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-100 dark:border-gray-800 p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Daily Trend</h3>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={heatmapData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="percentage"
                  stroke="#4F6BED"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#4F6BED' }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly comparison */}
        <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-100 dark:border-gray-800 p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Weekly Comparison</h3>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyBarData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="completed" radius={[6, 6, 0, 0]} maxBarSize={40}>
                  {weeklyBarData.map((entry, i) => (
                    <Cell key={i} fill={entry.percentage >= 80 ? '#22C55E' : entry.percentage >= 50 ? '#4F6BED' : '#C7D2FE'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Habit breakdown */}
        <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-100 dark:border-gray-800 p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Habit Breakdown</h3>
          <div className="h-[220px] flex items-center justify-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={40}
                    paddingAngle={2}
                    dataKey="value"
                  />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-gray-400">No data yet</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {pieData.slice(0, 6).map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                <span className="text-gray-600 dark:text-gray-400 truncate">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Consistency heatmap */}
        <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-100 dark:border-gray-800 p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Consistency Heatmap</h3>
          <div className="grid grid-cols-7 gap-1">
            {heatmapData.map((d, i) => (
              <div
                key={i}
                className={cn(
                  'aspect-square rounded-sm transition-colors',
                  d.percentage >= 80 ? 'bg-[#22C55E]' :
                  d.percentage >= 60 ? 'bg-[#22C55E]/70' :
                  d.percentage >= 40 ? 'bg-[#22C55E]/40' :
                  d.percentage >= 20 ? 'bg-[#22C55E]/20' :
                  d.percentage > 0 ? 'bg-[#22C55E]/10' :
                  'bg-gray-100 dark:bg-gray-800'
                )}
                title={`Day ${d.day}: ${d.percentage}%`}
              />
            ))}
          </div>
          <div className="flex items-center justify-end gap-1 mt-3 text-[10px] text-gray-400">
            <span>Less</span>
            {[10, 20, 40, 60, 80, 100].map(p => (
              <div
                key={p}
                className={cn(
                  'w-3 h-3 rounded-sm',
                  p >= 80 ? 'bg-[#22C55E]' :
                  p >= 60 ? 'bg-[#22C55E]/70' :
                  p >= 40 ? 'bg-[#22C55E]/40' :
                  p >= 20 ? 'bg-[#22C55E]/20' :
                  'bg-[#22C55E]/10'
                )}
              />
            ))}
            <span>More</span>
          </div>
        </div>
      </div>

      {/* Top & Bottom performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-100 dark:border-gray-800 p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Best Days</h3>
          {bestDays.length === 0 ? (
            <p className="text-sm text-gray-400">No data yet</p>
          ) : (
            <div className="space-y-2">
              {bestDays.map((d, i) => (
                <div key={i} className="flex items-center justify-between py-2 px-3 bg-[#22C55E]/5 rounded-lg">
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {getMonthName(currentMonth)} {d.day}
                  </span>
                  <span className="text-sm font-semibold text-[#22C55E]">
                    {d.completed}/{d.total} ({Math.round(d.percentage * 100)}%)
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-100 dark:border-gray-800 p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Needs Improvement</h3>
          {worstDays.length === 0 ? (
            <p className="text-sm text-gray-400">No data yet</p>
          ) : (
            <div className="space-y-2">
              {worstDays.map((d, i) => (
                <div key={i} className="flex items-center justify-between py-2 px-3 bg-[#EF4444]/5 rounded-lg">
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {getMonthName(currentMonth)} {d.day}
                  </span>
                  <span className="text-sm font-semibold text-[#EF4444]">
                    {d.completed}/{d.total} ({Math.round(d.percentage * 100)}%)
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
