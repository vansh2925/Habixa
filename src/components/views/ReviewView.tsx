'use client';

import { WeeklyReview } from '@/components/review/WeeklyReview';
import { motion } from 'framer-motion';

export function ReviewView() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <WeeklyReview />
    </motion.div>
  );
}
