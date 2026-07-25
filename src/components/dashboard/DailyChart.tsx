'use client';

import { useHabitStore } from '@/store/habit-store';
import { getActiveHabits, getEntriesForMonth, getDailyStats } from '@/lib/calculations';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export function DailyChart() {
  const { habits, entries, currentYear, currentMonth } = useHabitStore();
  const activeHabits = getActiveHabits(habits);
  const monthEntries = getEntriesForMonth(entries, currentYear, currentMonth);
  const dailyStats = getDailyStats(monthEntries, activeHabits, currentYear, currentMonth);

  const chartData = dailyStats.map(d => ({
    day: d.day,
    completed: d.completed,
    total: d.total,
    percentage: Math.round(d.percentage * 100),
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 shadow-lg">
          <p className="text-xs font-semibold text-gray-900 dark:text-white">
            Day {label}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {payload[0].value} completed
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-100 dark:border-gray-800 p-5">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
        Daily Completion
      </h3>

      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="day"
              tick={{ fontSize: 10, fill: '#9CA3AF' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#9CA3AF' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(79, 107, 237, 0.05)' }} />
            <Bar
              dataKey="completed"
              radius={[4, 4, 0, 0]}
              maxBarSize={20}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.percentage >= 80 ? '#22C55E' : entry.percentage >= 50 ? '#4F6BED' : '#C7D2FE'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
