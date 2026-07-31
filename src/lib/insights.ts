import { AIInsight, Habit, HabitEntry } from '@/types';
import { getDaysInMonth } from './date-utils';

export function generateInsights(
  habits: Habit[],
  entries: HabitEntry[],
  year: number,
  month: number
): AIInsight[] {
  const insights: AIInsight[] = [];
  const activeHabits = habits.filter(h => h.isActive);
  const daysInMonth = getDaysInMonth(new Date(year, month - 1));
  const monthPrefix = `${year}-${String(month).padStart(2, '0')}`;
  const monthEntries = entries.filter(e => e.date.startsWith(monthPrefix));

  if (activeHabits.length === 0 || monthEntries.length === 0) {
    return [{
      id: 'getting-started',
      type: 'recommendation',
      title: 'Start Your Journey',
      description: 'Begin tracking habits to unlock personalized insights about your patterns.',
      confidence: 1,
      icon: '🚀',
      priority: 'high',
    }];
  }

  // Pattern: Best day of week
  const dayOfWeekStats: Record<number, { completed: number; total: number }> = {};
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${monthPrefix}-${String(d).padStart(2, '0')}`;
    const date = new Date(year, month - 1, d);
    const dow = date.getDay();
    const dayEntries = monthEntries.filter(e => e.date === dateStr);
    const completed = dayEntries.filter(e => e.completed).length;

    if (!dayOfWeekStats[dow]) dayOfWeekStats[dow] = { completed: 0, total: 0 };
    dayOfWeekStats[dow].completed += completed;
    dayOfWeekStats[dow].total += activeHabits.length;
  }

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayPercentages = Object.entries(dayOfWeekStats).map(([dow, stats]) => ({
    day: dayNames[Number(dow)],
    percentage: stats.total > 0 ? stats.completed / stats.total : 0,
  })).filter(d => d.percentage > 0);

  if (dayPercentages.length >= 3) {
    const best = dayPercentages.reduce((a, b) => a.percentage > b.percentage ? a : b);
    const worst = dayPercentages.reduce((a, b) => a.percentage < b.percentage ? a : b);

    if (best.percentage - worst.percentage > 0.2) {
      insights.push({
        id: 'best-worst-day',
        type: 'pattern',
        title: `${best.day}s Are Your Strongest Day`,
        description: `You complete ${Math.round(best.percentage * 100)}% of habits on ${best.day}s vs ${Math.round(worst.percentage * 100)}% on ${worst.day}s. Consider scheduling challenging habits on your best days.`,
        confidence: 0.85,
        icon: '📊',
        priority: 'high',
      });
    }
  }

  // Pattern: Habit completion order
  const habitCompletionRates = activeHabits.map(habit => {
    let completed = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${monthPrefix}-${String(d).padStart(2, '0')}`;
      if (monthEntries.some(e => e.habitId === habit.id && e.date === dateStr && e.completed)) {
        completed++;
      }
    }
    return { name: habit.name, rate: completed / daysInMonth };
  }).sort((a, b) => b.rate - a.rate);

  const excellent = habitCompletionRates.filter(h => h.rate >= 0.8);
  const struggling = habitCompletionRates.filter(h => h.rate > 0 && h.rate < 0.3);

  if (excellent.length > 0 && struggling.length > 0) {
    insights.push({
      id: 'momentum-tip',
      type: 'recommendation',
      title: 'Stack Your Habits',
      description: `"${excellent[0].name}" is already strong at ${Math.round(excellent[0].rate * 100)}%. Try linking "${struggling[0].name}" right after it to build momentum.`,
      confidence: 0.75,
      icon: '🔗',
      priority: 'medium',
    });
  }

  // Prediction: streak forecast
  const recentDays = 7;
  let recentComplete = 0;
  let recentTotal = 0;
  for (let d = daysInMonth; d > Math.max(1, daysInMonth - recentDays); d--) {
    const dateStr = `${monthPrefix}-${String(d).padStart(2, '0')}`;
    const dayEntries = monthEntries.filter(e => e.date === dateStr);
    recentComplete += dayEntries.filter(e => e.completed).length;
    recentTotal += activeHabits.length;
  }

  const recentRate = recentTotal > 0 ? recentComplete / recentTotal : 0;

  if (recentRate > 0 && recentRate < 0.5) {
    insights.push({
      id: 'streak-warning',
      type: 'prediction',
      title: 'Streak at Risk',
      description: `Your completion rate dropped to ${Math.round(recentRate * 100)}% over the last week. Focus on your top 3 habits to recover momentum.`,
      confidence: 0.8,
      icon: '⚠️',
      priority: 'high',
    });
  } else if (recentRate >= 0.8) {
    insights.push({
      id: 'streak-strong',
      type: 'prediction',
      title: 'Momentum Is Strong',
      description: `You've maintained ${Math.round(recentRate * 100)}% completion this week. Keep this pace to finish the month strong!`,
      confidence: 0.9,
      icon: '🚀',
      priority: 'medium',
    });
  }

  // Correlation: check if completing morning habits predicts evening habits
  const morningHabits = activeHabits.filter(h => ['morning', 'spiritual'].includes(h.category));
  const otherHabits = activeHabits.filter(h => !['morning', 'spiritual'].includes(h.category));

  if (morningHabits.length > 0 && otherHabits.length > 0) {
    let morningToOther = 0;
    let totalMorningDays = 0;

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${monthPrefix}-${String(d).padStart(2, '0')}`;
      const dayEntries = monthEntries.filter(e => e.date === dateStr);
      const morningDone = morningHabits.filter(h =>
        dayEntries.some(e => e.habitId === h.id && e.completed)
      ).length;
      const otherDone = otherHabits.filter(h =>
        dayEntries.some(e => e.habitId === h.id && e.completed)
      ).length;

      if (morningDone === morningHabits.length) {
        totalMorningDays++;
        if (otherDone >= otherHabits.length * 0.5) morningToOther++;
      }
    }

    if (totalMorningDays >= 5) {
      const correlation = morningToOther / totalMorningDays;
      if (correlation > 0.7) {
        insights.push({
          id: 'morning-correlation',
          type: 'correlation',
          title: 'Morning Routine = Productive Day',
          description: `When you complete your morning habits, you're ${Math.round(correlation * 100)}% likely to complete the rest of your day. Put your morning routine first so it anchors your whole day.`,
          confidence: correlation,
          icon: '🌅',
          priority: 'high',
          action: {
            label: 'Reorder to anchor',
            kind: 'reorder',
            habitIds: morningHabits.map(h => h.id),
            appliedLabel: 'Reordered — morning habits first',
          },
        });
      }
    }
  }

  // Milestone approaching
  const totalCompleted = monthEntries.filter(e => e.completed).length;
  const milestones = [50, 100, 200, 500, 1000];
  for (const m of milestones) {
    if (totalCompleted >= m - 5 && totalCompleted < m) {
      insights.push({
        id: `milestone-${m}`,
        type: 'milestone',
        title: `${m - totalCompleted} Away from ${m}!`,
        description: `You've completed ${totalCompleted} habit entries. Just ${m - totalCompleted} more to reach the ${m} milestone!`,
        confidence: 1,
        icon: '🎯',
        priority: 'medium',
      });
      break;
    }
  }

  // Diagnostic: miss reasons (captured via the miss prompt)
  const missReasons = monthEntries.filter(e => e.missedReason);
  if (missReasons.length >= 2) {
    const reasonCounts: Record<string, number> = {};
    for (const e of missReasons) {
      reasonCounts[e.missedReason!] = (reasonCounts[e.missedReason!] || 0) + 1;
    }
    const topReason = Object.entries(reasonCounts).sort((a, b) => b[1] - a[1])[0];
    const reasonLabels: Record<string, string> = {
      'no-time': 'running out of time',
      forgot: 'simply forgetting',
      'low-energy': 'low energy',
      'not-motivated': 'lacking motivation',
    };

    // Correlate the top reason with a day of week
    const reasonByDay: Record<number, { count: number; habit: string }> = {};
    for (const e of missReasons) {
      if (e.missedReason !== topReason[0]) continue;
      const d = new Date(e.date + 'T00:00:00');
      const dow = d.getDay();
      const habitName = activeHabits.find(h => h.id === e.habitId)?.name || 'a habit';
      if (!reasonByDay[dow]) reasonByDay[dow] = { count: 0, habit: habitName };
      reasonByDay[dow].count++;
      reasonByDay[dow].habit = habitName;
    }
    const topDay = Object.entries(reasonByDay).sort((a, b) => b[1].count - a[1].count)[0];
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    if (topReason && topReason[0] && topReason[1] >= 2) {
      insights.push({
        id: 'miss-reason-pattern',
        type: 'correlation',
        title: `The Real Reason You Skip: ${topDay ? dayNames[Number(topDay[0])] + 's' : 'Sometimes'}`,
        description: topDay
          ? `You've missed habits ${topReason[1]} time${topReason[1] > 1 ? 's' : ''} mostly due to ${reasonLabels[topReason[0]]} — especially on ${dayNames[Number(topDay[0])]} (e.g. "${topDay[1].habit}"). That points to a scheduling or recovery issue, not a willpower one.`
          : `Your most common miss reason is ${reasonLabels[topReason[0]]} (${topReason[1]}×). Address the cause, not the habit.`,
        confidence: 0.75,
        icon: '🔍',
        priority: 'high',
      });
    }
  }

  // Struggling habits recommendation
  if (struggling.length > 0) {
    insights.push({
      id: 'simplify-struggling',
      type: 'recommendation',
      title: 'Consider Simplifying',
      description: `"${struggling[0].name}" is at ${Math.round(struggling[0].rate * 100)}%. Try reducing it to 3 days/week or breaking it into smaller steps.`,
      confidence: 0.7,
      icon: '💡',
      priority: 'low',
    });
  }

  return insights.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}
