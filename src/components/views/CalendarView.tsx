'use client';

import { CalendarView } from '@/components/calendar/CalendarView';
import { motion } from 'framer-motion';

export function CalendarViewWrapper() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <CalendarView />
    </motion.div>
  );
}
