'use client';

import { HeatmapCalendar } from '@/components/heatmap/HeatmapCalendar';
import { motion } from 'framer-motion';

export function HeatmapView() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <HeatmapCalendar />
    </motion.div>
  );
}
