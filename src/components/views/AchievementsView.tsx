'use client';

import { AchievementBadges } from '@/components/achievements/AchievementBadges';
import { motion } from 'framer-motion';

export function AchievementsView() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <AchievementBadges />
    </motion.div>
  );
}
