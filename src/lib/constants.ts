export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
] as const;

export const MONTH_ABBREVS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
] as const;

export const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
export const WEEKDAYS_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const;

export const DEFAULT_HABITS = [
  { name: 'Wake up at 5AM', category: 'morning', sortOrder: 1 },
  { name: 'Affirmations & Brush teeth', category: 'morning', sortOrder: 2 },
  { name: 'Meditation (2min)', category: 'morning', sortOrder: 3 },
  { name: 'Assignment Session', category: 'work', sortOrder: 4 },
  { name: 'Read 10 Pages (DSTSS)', category: 'learning', sortOrder: 5 },
  { name: 'Breakfast', category: 'health', sortOrder: 6 },
  { name: 'Take shower', category: 'morning', sortOrder: 7 },
  { name: 'Prayer', category: 'spiritual', sortOrder: 8 },
  { name: 'Learning AI (LND setup)', category: 'work', sortOrder: 9 },
  { name: 'Lunch', category: 'health', sortOrder: 10 },
  { name: 'Learning AI (NYC setup)', category: 'work', sortOrder: 11 },
  { name: 'Dinner', category: 'health', sortOrder: 12 },
  { name: 'Learning AI till 12am', category: 'work', sortOrder: 13 },
  { name: 'Sleep at 12am', category: 'routine', sortOrder: 14 },
  { name: 'No Fap', category: 'discipline', sortOrder: 15 },
];

export const CATEGORIES = [
  { id: 'morning', name: 'Morning Routine', color: '#F59E0B' },
  { id: 'work', name: 'Work & Learning', color: '#3B82F6' },
  { id: 'health', name: 'Health & Nutrition', color: '#22C55E' },
  { id: 'spiritual', name: 'Spiritual', color: '#8B5CF6' },
  { id: 'learning', name: 'Reading & Learning', color: '#EC4899' },
  { id: 'discipline', name: 'Discipline', color: '#EF4444' },
  { id: 'routine', name: 'Daily Routine', color: '#6B7280' },
  { id: 'general', name: 'General', color: '#64748B' },
] as const;

export const STORAGE_KEYS = {
  HABITS: 'habit-tracker-habits',
  ENTRIES: 'habit-tracker-entries',
  SETTINGS: 'habit-tracker-settings',
  THEME: 'habit-tracker-theme',
} as const;

export const COLORS = {
  accent: '#4F6BED',
  accentLight: '#EEF0FF',
  success: '#22C55E',
  successLight: '#DCFCE7',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  background: '#F8F9FA',
  card: '#FFFFFF',
  text: '#1E1E1E',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
} as const;

export const CHART_COLORS = [
  '#4F6BED', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#06B6D4', '#F97316', '#14B8A6', '#6366F1',
];
