export interface Habit {
  id: string;
  name: string;
  description?: string;
  category: string;
  goalDays: number;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  scheduledDays?: number[]; // 0=Sun, 1=Mon, ... 6=Sat. Undefined = every day
}

export interface HabitEntry {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  completedAt?: string;
  notes?: string;
  mood?: number; // 1-5
}

export interface MonthlyStats {
  totalCompleted: number;
  totalGoal: number;
  totalRemaining: number;
  overallProgress: number;
  dailyStats: DailyStat[];
  weeklyStats: WeeklyStat[];
  habitStats: HabitStat[];
}

export interface DailyStat {
  date: string;
  day: number;
  completed: number;
  total: number;
  remaining: number;
  percentage: number;
}

export interface WeeklyStat {
  week: number;
  startDate: string;
  endDate: string;
  completed: number;
  total: number;
  percentage: number;
}

export interface HabitStat {
  habitId: string;
  habitName: string;
  completed: number;
  goal: number;
  remaining: number;
  percentage: number;
  rank: number;
}

export interface DashboardData {
  todayCompleted: number;
  todayTotal: number;
  todayRemaining: number;
  todayPercentage: number;
  monthlyCompleted: number;
  monthlyGoal: number;
  monthlyRemaining: number;
  monthlyPercentage: number;
  currentStreak: number;
  longestStreak: number;
  weeklyStats: WeeklyStat[];
  topHabits: HabitStat[];
  recentActivity: DailyStat[];
}

// Achievement System
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'streak' | 'completion' | 'consistency' | 'milestone' | 'special';
  requirement: number;
  priority: number;
  unlocked: boolean;
  unlockedAt?: string;
  progress: number; // 0-1
}

// Weekly Review
export interface WeeklyReview {
  weekNumber: number;
  startDate: string;
  endDate: string;
  overallScore: number; // 0-100
  totalCompleted: number;
  totalTarget: number;
  bestDay: { day: string; score: number };
  worstDay: { day: string; score: number };
  habitBreakdown: {
    habitId: string;
    habitName: string;
    completed: number;
    target: number;
    streak: number;
    trend: 'improving' | 'stable' | 'declining';
  }[];
  insights: string[];
  moodAverage?: number;
  comparisonToPrevious: number; // percentage change
}

// AI Insights
export interface AIInsight {
  id: string;
  type: 'pattern' | 'prediction' | 'recommendation' | 'correlation' | 'milestone';
  title: string;
  description: string;
  confidence: number; // 0-1
  icon: string;
  priority: 'high' | 'medium' | 'low';
}

export type ViewMode = 'dashboard' | 'habits' | 'calendar' | 'analytics' | 'settings' | 'achievements' | 'review' | 'insights' | 'heatmap';

export interface ThemeState {
  isDark: boolean;
  toggle: () => void;
}
