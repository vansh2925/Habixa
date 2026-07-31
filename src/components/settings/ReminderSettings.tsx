'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { isSupabaseConfigured, createClient } from '@/lib/supabase/client';
import {
  isPushSupported, subscribeToPush, saveSubscription, unsubscribeFromPush, getCurrentSubscription,
} from '@/lib/push-client';
import { Bell, BellOff, Loader2, CheckCircle2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export function ReminderSettings() {
  const { user } = useAuth();
  const [supported, setSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('unsupported');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [reminderTime, setReminderTime] = useState('20:00');
  const [reminderEnabled, setReminderEnabled] = useState(false);

  const configured = isSupabaseConfigured();

  // On mount: detect support + existing state
  useEffect(() => {
    if (!configured) return;
    const supported = isPushSupported();
    setSupported(supported);
    if (supported) {
      setPermission(Notification.permission);
      getCurrentSubscription().then(sub => setSubscribed(!!sub));
    }
    // Load reminder settings
    const load = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('reminders')
        .select('time, enabled')
        .eq('user_id', user?.id)
        .single();
      if (data) {
        setReminderTime(data.time || '20:00');
        setReminderEnabled(data.enabled ?? false);
      }
    };
    if (user) load();
  }, [configured, user]);

  const handleEnable = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const sub = await subscribeToPush();
      if (!sub) {
        setMessage({ type: 'error', text: 'Notification permission denied or not supported.' });
        setLoading(false);
        return;
      }
      const saved = await saveSubscription(sub);
      setSubscribed(true);
      setPermission(Notification.permission);
      setMessage(
        saved
          ? { type: 'success', text: 'Notifications enabled. Set your reminder time below.' }
          : { type: 'error', text: 'Permission granted, but we could not save the subscription. Check server setup.' }
      );
    } catch (e) {
      setMessage({ type: 'error', text: 'Failed to enable notifications.' });
      console.error(e);
    }
    setLoading(false);
  };

  const handleDisable = async () => {
    setLoading(true);
    await unsubscribeFromPush();
    setSubscribed(false);
    setMessage({ type: 'success', text: 'Notifications disabled.' });
    setLoading(false);
  };

  const handleSaveReminder = async () => {
    if (!user) return;
    const supabase = createClient();
    const { error } = await supabase.from('reminders').upsert(
      { user_id: user.id, time: reminderTime, enabled: reminderEnabled, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    );
    if (error) {
      setMessage({ type: 'error', text: 'Failed to save reminder time.' });
    } else {
      setMessage({ type: 'success', text: 'Reminder saved. We\'ll nudge you at ' + reminderTime + '.' });
    }
  };

  // Not configured
  if (!configured) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
      className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden"
    >
      <div className="px-5 py-4 border-b border-gray-50 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#4F6BED]" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Daily Reminder</h3>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          Get a push notification at your chosen time with what&apos;s left today
        </p>
      </div>

      <div className="p-5 space-y-4">
        {/* Message */}
        {message && (
          <div className={cn(
            'p-3 rounded-lg text-sm flex items-center gap-2',
            message.type === 'success'
              ? 'bg-[#22C55E]/10 text-[#22C55E]'
              : 'bg-[#EF4444]/10 text-[#EF4444]'
          )}>
            {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
            {message.text}
          </div>
        )}

        {!supported ? (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Push notifications aren&apos;t supported in this browser. Try Chrome or Edge.
          </div>
        ) : !subscribed ? (
          <button
            onClick={handleEnable}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#4F6BED] text-white text-sm font-medium rounded-lg hover:bg-[#3D57D9] transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4" />}
            Enable Notifications
          </button>
        ) : (
          <>
            {/* Reminder time + enabled toggle */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Reminder time</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">We&apos;ll nudge you daily</p>
              </div>
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4F6BED]/50"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Enabled</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">On = send daily reminder</p>
              </div>
              <button
                onClick={() => setReminderEnabled(!reminderEnabled)}
                className={cn(
                  'w-11 h-6 rounded-full transition-colors duration-200 flex items-center px-0.5',
                  reminderEnabled ? 'bg-[#22C55E] justify-end' : 'bg-gray-200 dark:bg-gray-700 justify-start'
                )}
              >
                <div className="w-5 h-5 bg-white rounded-full shadow" />
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSaveReminder}
                className="flex-1 px-4 py-2.5 bg-[#4F6BED] text-white text-sm font-medium rounded-lg hover:bg-[#3D57D9] transition-colors"
              >
                Save Reminder
              </button>
              <button
                onClick={handleDisable}
                disabled={loading}
                className="px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
