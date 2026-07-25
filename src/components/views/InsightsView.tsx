'use client';

import { AIInsights } from '@/components/insights/AIInsights';
import { motion } from 'framer-motion';

export function InsightsView() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <AIInsights />
    </motion.div>
  );
}
