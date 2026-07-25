'use client';

import { SocialAccountability } from '@/components/social/SocialAccountability';
import { motion } from 'framer-motion';

export function SocialView() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <SocialAccountability />
    </motion.div>
  );
}
