'use client';

import { AnalyticsView } from '@/components/analytics/AnalyticsView';
import { motion } from 'framer-motion';

export function AnalyticsViewWrapper() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <AnalyticsView />
    </motion.div>
  );
}
