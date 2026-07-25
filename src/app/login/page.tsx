'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { Flame, Mail, Loader2, CheckCircle2, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoginPage() {
  const router = useRouter();
  const { user, loading: authLoading, signInWithOtp } = useAuth();
  const configured = isSupabaseConfigured();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    const result = await signInWithOtp(email.trim());
    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      setSent(true);
    }
  };

  // Not configured state
  if (!configured) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0a0a0a] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[400px]"
        >
          <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-100 dark:border-gray-800 p-8 text-center">
            <div className="w-12 h-12 rounded-xl bg-[#4F6BED] flex items-center justify-center mx-auto mb-4">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">HabitFlow</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Authentication is not configured yet. Set up Supabase to enable login.
            </p>
            <a
              href="/"
              className="inline-flex items-center justify-center w-full px-4 py-2.5 bg-[#4F6BED] text-white text-sm font-medium rounded-lg hover:bg-[#3D57D9] transition-colors"
            >
              Continue without sign-in
            </a>
          </div>
        </motion.div>
      </div>
    );
  }

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-[#4F6BED] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0a0a0a] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[400px]"
      >
        <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-100 dark:border-gray-800 p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-[#4F6BED] flex items-center justify-center mx-auto mb-4">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">HabitFlow</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {sent ? 'Check your email' : 'Sign in with your email'}
            </p>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 p-3 bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-lg text-sm text-[#EF4444]"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {!sent ? (
              <motion.form
                key="email-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleSendMagicLink}
                className="space-y-4"
              >
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1.5">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4F6BED]/50 focus:border-[#4F6BED]"
                      autoFocus
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#4F6BED] text-white text-sm font-medium rounded-lg hover:bg-[#3D57D9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>Send Magic Link</>
                  )}
                </button>
              </motion.form>
            ) : (
              <motion.div
                key="sent-confirmation"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-4"
              >
                <div className="w-16 h-16 mx-auto rounded-full bg-[#22C55E]/10 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-[#22C55E]" />
                </div>

                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-200 mb-1">
                    We sent a sign-in link to
                  </p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {email}
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Click the link in the email to sign in. The link expires in 5 minutes.
                  </p>
                </div>

                <div className="flex items-center justify-center gap-1 text-xs text-gray-400">
                  <ExternalLink className="w-3 h-3" />
                  <span>Check your spam folder if you don&apos;t see it</span>
                </div>

                <button
                  onClick={() => {
                    setSent(false);
                    setEmail('');
                    setError('');
                  }}
                  className="text-sm text-[#4F6BED] hover:text-[#3D57D9] font-medium transition-colors"
                >
                  Try a different email
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
