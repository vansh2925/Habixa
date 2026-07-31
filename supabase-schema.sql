-- Create habits table
CREATE TABLE IF NOT EXISTS habits (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general',
  goal_days INTEGER DEFAULT 30,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  schedule_type TEXT DEFAULT 'daily',
  schedule_days INTEGER[] DEFAULT '{}',
  times_per_week INTEGER DEFAULT 3
);

-- Add schedule columns to existing table (if upgrading from previous version)
ALTER TABLE habits ADD COLUMN IF NOT EXISTS schedule_type TEXT DEFAULT 'daily';
ALTER TABLE habits ADD COLUMN IF NOT EXISTS schedule_days INTEGER[] DEFAULT '{}';
ALTER TABLE habits ADD COLUMN IF NOT EXISTS times_per_week INTEGER DEFAULT 3;

-- Create entries table
CREATE TABLE IF NOT EXISTS habit_entries (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  habit_id TEXT NOT NULL,
  date TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  mood INTEGER,
  missed_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, habit_id, date)
);

-- Add columns to existing table (if upgrading)
ALTER TABLE habit_entries ADD COLUMN IF NOT EXISTS mood INTEGER;
ALTER TABLE habit_entries ADD COLUMN IF NOT EXISTS missed_reason TEXT;

-- Enable Row Level Security
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_entries ENABLE ROW LEVEL SECURITY;

-- Habits policies: users can only read/write their own data
CREATE POLICY "Users can view own habits"
  ON habits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own habits"
  ON habits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own habits"
  ON habits FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own habits"
  ON habits FOR DELETE
  USING (auth.uid() = user_id);

-- Entries policies: users can only read/write their own data
CREATE POLICY "Users can view own entries"
  ON habit_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own entries"
  ON habit_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own entries"
  ON habit_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own entries"
  ON habit_entries FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_habits_user_id ON habits(user_id);
CREATE INDEX idx_entries_user_id ON habit_entries(user_id);
CREATE INDEX idx_entries_habit_id ON habit_entries(habit_id);
CREATE INDEX idx_entries_date ON habit_entries(date);
CREATE INDEX idx_entries_user_habit_date ON habit_entries(user_id, habit_id, date);
