'use client';

import { SettingsView } from '@/components/settings/SettingsView';
import { motion } from 'framer-motion';

export function SettingsViewWrapper() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <SettingsView />
    </motion.div>
  );
}
