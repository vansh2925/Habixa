'use client';

import { HabitTracker } from '@/components/habits/HabitTracker';
import { motion } from 'framer-motion';

export function HabitsView() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <HabitTracker />
    </motion.div>
  );
}
