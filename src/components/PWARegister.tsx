'use client';

import { useEffect } from 'react';
import { registerServiceWorker } from '@/lib/push-client';

// Registers the service worker once on mount so push notifications work.
export function PWARegister() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    registerServiceWorker();
  }, []);
  return null;
}
