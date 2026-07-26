'use client';

import { useMemo, useState } from 'react';
import { useHabitStore } from '@/store/habit-store';
import { getActiveHabits, getEntriesForMonth, calculateOverallStreak, getWeeklyStats } from '@/lib/calculations';
import { getMonthName } from '@/lib/date-utils';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Share2, Copy, Check, Users, Trophy, Flame, Target, MessageCircle, ExternalLink } from 'lucide-react';

const DEMO_PARTNERS = [
  { id: '1', name: 'Alex Chen', avatar: '🧑‍💻', streak: 12, completionRate: 0.87, lastActive: '2 hours ago', isCurrentUser: false },
  { id: '2', name: 'Sarah Kim', avatar: '👩‍🎨', streak: 23, completionRate: 0.95, lastActive: '1 hour ago', isCurrentUser: false },
  { id: '3', name: 'Mike Ross', avatar: '👨‍💼', streak: 5, completionRate: 0.72, lastActive: '30 min ago', isCurrentUser: false },
];

const MOTIVATIONAL_MESSAGES = [
  "You're doing amazing! Keep pushing forward! 💪",
  "Consistency is the key to success. You've got this! 🔥",
  "Every small step counts towards your bigger goal! 🌟",
  "Your future self will thank you for not giving up! 🚀",
  "Progress, not perfection. Keep going! ✨",
];

export function SocialAccountability() {
  const { habits, entries, currentYear, currentMonth } = useHabitStore();
  const activeHabits = getActiveHabits(habits);
  const monthEntries = getEntriesForMonth(entries, currentYear, currentMonth);
  const streak = calculateOverallStreak(monthEntries, activeHabits, currentYear, currentMonth);
  const weeklyStats = getWeeklyStats(monthEntries, activeHabits, currentYear, currentMonth);

  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState('');
  const [showShareCard, setShowShareCard] = useState(false);

  const totalCompleted = monthEntries.filter(e => e.completed).length;
  const totalGoal = activeHabits.length * 30;
  const completionRate = totalGoal > 0 ? totalCompleted / totalGoal : 0;

  const currentWeekStats = weeklyStats[weeklyStats.length - 1];
  const weeklyPercentage = currentWeekStats ? currentWeekStats.percentage : 0;

  const randomMessage = useMemo(() => {
    return MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)];
  }, []);

  const generateShareText = () => {
    return `🔥 HabiXa Progress — ${getMonthName(currentMonth)} ${currentYear}\n\n` +
      `📊 Completion: ${Math.round(completionRate * 100)}%\n` +
      `🔥 Current Streak: ${streak.current} days\n` +
      `✅ ${totalCompleted} habits completed\n` +
      `📈 This Week: ${Math.round(weeklyPercentage * 100)}%\n\n` +
      `#HabiXa #HabitTracker`;
  };

  const handleCopyProgress = () => {
    navigator.clipboard.writeText(generateShareText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareNative = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My HabiXa Progress',
        text: generateShareText(),
      });
    } else {
      handleCopyProgress();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Accountability</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Share progress and stay motivated together
        </p>
      </div>

      {/* Motivational banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-[#4F6BED]/10 to-[#8B5CF6]/10 dark:from-[#4F6BED]/20 dark:to-[#8B5CF6]/20 rounded-xl border border-[#4F6BED]/20 p-5"
      >
        <p className="text-sm font-medium text-[#4F6BED] dark:text-[#818CF8]">
          {randomMessage}
        </p>
      </motion.div>

      {/* Your progress card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-gray-50 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Your Progress</h3>
            <div className="flex gap-2">
              <button
                onClick={handleShareNative}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#4F6BED] text-white text-xs font-medium rounded-lg hover:bg-[#3D57D9] transition-colors"
              >
                <Share2 className="w-3 h-3" />
                Share
              </button>
              <button
                onClick={handleCopyProgress}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-[#22C55E]" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        </div>

        <div className="p-5">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-[#F59E0B]/10 flex items-center justify-center mb-2">
                <Flame className="w-6 h-6 text-[#F59E0B]" />
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">{streak.current}</div>
              <div className="text-[10px] text-gray-500">Day Streak</div>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-[#4F6BED]/10 flex items-center justify-center mb-2">
                <Target className="w-6 h-6 text-[#4F6BED]" />
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">{Math.round(completionRate * 100)}%</div>
              <div className="text-[10px] text-gray-500">Completion</div>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-[#22C55E]/10 flex items-center justify-center mb-2">
                <Trophy className="w-6 h-6 text-[#22C55E]" />
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">{totalCompleted}</div>
              <div className="text-[10px] text-gray-500">Completed</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Accountability partners */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#4F6BED]" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Accountability Partners</h3>
          </div>
        </div>

        <div className="divide-y divide-gray-50 dark:divide-gray-800/50">
          {DEMO_PARTNERS.map((partner, i) => (
            <motion.div
              key={partner.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * i }}
              className="flex items-center gap-3 px-5 py-3.5"
            >
              <span className="text-2xl">{partner.avatar}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-200">{partner.name}</div>
                <div className="text-[11px] text-gray-400">Active {partner.lastActive}</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <Flame className="w-3 h-3 text-[#F59E0B]" />
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{partner.streak}</span>
                  </div>
                  <div className="text-[10px] text-gray-400">streak</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-semibold text-[#22C55E]">{Math.round(partner.completionRate * 100)}%</div>
                  <div className="text-[10px] text-gray-400">rate</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="px-5 py-3 border-t border-gray-50 dark:border-gray-800">
          <button className="w-full flex items-center justify-center gap-2 text-xs text-[#4F6BED] font-medium hover:text-[#3D57D9] transition-colors py-1">
            <Users className="w-3.5 h-3.5" />
            Invite a Friend
          </button>
        </div>
      </div>

      {/* Quick motivation */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-100 dark:border-gray-800 p-5">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Daily Check-in</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Share how you're feeling today..."
            className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4F6BED]/50"
          />
          <button className="px-4 py-2 bg-[#4F6BED] text-white text-sm font-medium rounded-lg hover:bg-[#3D57D9] transition-colors flex items-center gap-1.5">
            <MessageCircle className="w-4 h-4" />
            Post
          </button>
        </div>
      </div>

      {/* Share card preview */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-100 dark:border-gray-800 p-5">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Shareable Progress Card</h3>
        <div className="bg-gradient-to-br from-[#4F6BED] to-[#8B5CF6] rounded-xl p-5 text-white">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
            <span className="font-semibold text-sm">HabiXa</span>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div className="bg-white/10 rounded-lg p-2 text-center">
              <div className="text-lg font-bold">{streak.current}</div>
              <div className="text-[9px] opacity-70">Day Streak</div>
            </div>
            <div className="bg-white/10 rounded-lg p-2 text-center">
              <div className="text-lg font-bold">{Math.round(completionRate * 100)}%</div>
              <div className="text-[9px] opacity-70">Monthly</div>
            </div>
            <div className="bg-white/10 rounded-lg p-2 text-center">
              <div className="text-lg font-bold">{totalCompleted}</div>
              <div className="text-[9px] opacity-70">Completed</div>
            </div>
          </div>
          <p className="text-[10px] opacity-60 text-center">
            {getMonthName(currentMonth)} {currentYear} • habitflow.app
          </p>
        </div>
      </div>
    </div>
  );
}
