'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { isSupabaseConfigured, createClient } from '@/lib/supabase/client';
import { Flame, Mail, Loader2, CheckCircle2, ExternalLink, Shield, ArrowRight, Zap, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoginPage() {
  const router = useRouter();
  const { user, loading: authLoading, signInWithOtp } = useAuth();
  const configured = isSupabaseConfigured();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Load remember me preference
  useEffect(() => {
    const saved = localStorage.getItem('habitflow-remember-me');
    if (saved !== null) {
      setRememberMe(saved !== 'false');
    }
  }, []);

  // If "Remember Me" is unchecked, sign out when the browser closes
  useEffect(() => {
    if (!configured || rememberMe) return;

    const handleBeforeUnload = () => {
      try {
        const supabase = createClient();
        // Use sendBeacon to reliably fire on page close
        const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/logout`;
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        navigator.sendBeacon(url, JSON.stringify({}));
      } catch {
        // Silent fail on close
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [configured, rememberMe]);

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

  const toggleRememberMe = () => {
    const newValue = !rememberMe;
    setRememberMe(newValue);
    localStorage.setItem('habitflow-remember-me', String(newValue));
  };

  // Not configured state
  if (!configured) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0a0a0a] flex">
        {/* Left side — branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#4F6BED] to-[#7C3AED] p-12 flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-semibold text-lg">HabitFlow</span>
          </div>

          <div className="space-y-8">
            <div>
              <h2 className="text-4xl font-bold text-white leading-tight mb-4">
                Build habits that<br />stick forever.
              </h2>
              <p className="text-white/70 text-lg max-w-md">
                Track your daily routines, build streaks, and become the best version of yourself.
              </p>
            </div>

            <div className="space-y-4">
              {[
                { icon: Zap, text: 'Track unlimited habits' },
                { icon: BarChart3, text: 'AI-powered insights' },
                { icon: Shield, text: 'Secure & private' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3 text-white/80">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm">{text}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-white/40 text-xs">
            © 2026 HabitFlow. All rights reserved.
          </p>
        </div>

        {/* Right side — form */}
        <div className="flex-1 flex items-center justify-center p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-[400px]"
          >
            {/* Mobile logo */}
            <div className="lg:hidden flex items-center gap-2.5 mb-8">
              <div className="w-9 h-9 rounded-lg bg-[#4F6BED] flex items-center justify-center">
                <Flame className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">HabitFlow</span>
            </div>

            <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-100 dark:border-gray-800 p-8 text-center">
              <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6 text-gray-400" />
              </div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Setup Required</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Connect Supabase to enable authentication for your habit tracker.
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
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0a0a0a] flex">
      {/* Left side — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#4F6BED] to-[#7C3AED] p-12 flex-col justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <Flame className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-semibold text-lg">HabitFlow</span>
        </div>

        <div className="space-y-8">
          <div>
            <h2 className="text-4xl font-bold text-white leading-tight mb-4">
              Build habits that<br />stick forever.
            </h2>
            <p className="text-white/70 text-lg max-w-md">
              Track your daily routines, build streaks, and become the best version of yourself.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { icon: Zap, text: 'Track unlimited habits' },
              { icon: BarChart3, text: 'AI-powered insights' },
              { icon: Shield, text: 'Secure & private' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-white/80">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-white/40 text-xs">
          © 2026 HabitFlow. All rights reserved.
        </p>
      </div>

      {/* Right side — form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[400px]"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-lg bg-[#4F6BED] flex items-center justify-center">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">HabitFlow</span>
          </div>

          <div className="space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {sent ? 'Check your email' : 'Welcome back'}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {sent
                  ? 'We sent a sign-in link to your inbox'
                  : 'Sign in to continue tracking your habits'}
              </p>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-3 bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-xl text-sm text-[#EF4444]"
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
                  {/* Email */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                      Email address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4F6BED]/50 focus:border-[#4F6BED] transition-all"
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* Remember me */}
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={toggleRememberMe}
                      className="flex items-center gap-2.5 group"
                    >
                      <div className={`w-4.5 h-4.5 rounded border-2 flex items-center justify-center transition-all duration-150 ${
                        rememberMe
                          ? 'bg-[#4F6BED] border-[#4F6BED]'
                          : 'border-gray-300 dark:border-gray-600 group-hover:border-[#4F6BED]/50'
                      }`}>
                        {rememberMe && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Keep me signed in
                      </span>
                    </button>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#4F6BED] text-white text-sm font-semibold rounded-xl hover:bg-[#3D57D9] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-[#4F6BED]/20"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        Continue with email
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </motion.form>
              ) : (
                <motion.div
                  key="sent-confirmation"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-5"
                >
                  {/* Success illustration */}
                  <div className="flex justify-center">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full bg-[#22C55E]/10 flex items-center justify-center">
                        <CheckCircle2 className="w-10 h-10 text-[#22C55E]" />
                      </div>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3, type: 'spring' }}
                        className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-white dark:bg-[#1a1a1a] border-2 border-[#22C55E] flex items-center justify-center"
                      >
                        <Mail className="w-3.5 h-3.5 text-[#22C55E]" />
                      </motion.div>
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      We sent a magic link to
                    </p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {email}
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                      Click the link in the email to sign in.
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
                      The link expires in 5 minutes.
                    </p>
                  </div>

                  <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
                    <ExternalLink className="w-3 h-3" />
                    <span>Check your spam folder if you don&apos;t see it</span>
                  </div>

                  <button
                    onClick={() => {
                      setSent(false);
                      setEmail('');
                      setError('');
                    }}
                    className="w-full text-sm text-[#4F6BED] hover:text-[#3D57D9] font-medium transition-colors py-2"
                  >
                    Try a different email
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Footer */}
            {!sent && (
              <p className="text-center text-xs text-gray-400 dark:text-gray-500 pt-2">
                No password needed. We&apos;ll send you a magic link.
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
