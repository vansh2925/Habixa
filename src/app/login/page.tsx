'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import {
  Flame, Mail, KeyRound, Loader2, CheckCircle2,
  Shield, ArrowRight, ArrowLeft, Zap, BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoginPage() {
  const router = useRouter();
  const { user, loading: authLoading, signInWithOtp, verifyOtp } = useAuth();
  const configured = isSupabaseConfigured();
  const otpInputRef = useRef<HTMLInputElement>(null);

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [rememberMe, setRememberMe] = useState(true);
  const [resendTimer, setResendTimer] = useState(0);

  // Load remember me preference
  useEffect(() => {
    const saved = localStorage.getItem('habitflow-remember-me');
    if (saved !== null) setRememberMe(saved !== 'false');
  }, []);

  // Auto-focus OTP input when step changes
  useEffect(() => {
    if (step === 'otp') {
      setTimeout(() => otpInputRef.current?.focus(), 100);
    }
  }, [step]);

  // Resend countdown
  useEffect(() => {
    if (resendTimer <= 0) return;
    const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendTimer]);

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) router.push('/');
  }, [user, authLoading, router]);

  // Handle send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) { setError('Please enter your email address'); return; }

    setLoading(true);
    const result = await signInWithOtp(email.trim());
    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      setStep('otp');
      setResendTimer(60);
    }
  };

  // Handle verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!otp.trim() || otp.trim().length !== 6) {
      setError('Please enter the 6-digit code');
      return;
    }

    setLoading(true);
    const result = await verifyOtp(email.trim(), otp.trim());
    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      router.push('/');
    }
  };

  // Handle resend
  const handleResend = async () => {
    setError('');
    setOtp('');
    setLoading(true);
    const result = await signInWithOtp(email.trim());
    setLoading(false);
    if (!result.error) setResendTimer(60);
  };

  // Toggle remember me
  const toggleRememberMe = () => {
    const newValue = !rememberMe;
    setRememberMe(newValue);
    localStorage.setItem('habitflow-remember-me', String(newValue));
  };

  // Not configured
  if (!configured) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0a0a0a] flex">
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
              {[{ icon: Zap, text: 'Track unlimited habits' }, { icon: BarChart3, text: 'AI-powered insights' }, { icon: Shield, text: 'Secure & private' }].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3 text-white/80">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center"><Icon className="w-4 h-4" /></div>
                  <span className="text-sm">{text}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-white/40 text-xs">© 2026 HabitFlow. All rights reserved.</p>
        </div>
        <div className="flex-1 flex items-center justify-center p-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-[400px]">
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
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Connect Supabase to enable authentication.</p>
              <a href="/" className="inline-flex items-center justify-center w-full px-4 py-2.5 bg-[#4F6BED] text-white text-sm font-medium rounded-lg hover:bg-[#3D57D9] transition-colors">
                Continue without sign-in
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-[#4F6BED] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0a0a0a] flex">
      {/* Left branding */}
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
            {[{ icon: Zap, text: 'Track unlimited habits' }, { icon: BarChart3, text: 'AI-powered insights' }, { icon: Shield, text: 'Secure & private' }].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-white/80">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center"><Icon className="w-4 h-4" /></div>
                <span className="text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-white/40 text-xs">© 2026 HabitFlow. All rights reserved.</p>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-[400px]">
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
                {step === 'otp' ? 'Enter verification code' : 'Welcome back'}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {step === 'otp'
                  ? <>We sent a 6-digit code to <span className="font-medium text-gray-700 dark:text-gray-200">{email}</span></>
                  : 'Enter your email to receive a verification code'}
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
              {step === 'email' ? (
                /* Step 1: Email */
                <motion.form
                  key="email-step"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleSendOtp}
                  className="space-y-4"
                >
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

                  {/* Remember Me */}
                  <button type="button" onClick={toggleRememberMe} className="flex items-center gap-2.5 group">
                    <div className={`w-[18px] h-[18px] rounded border-2 flex items-center justify-center transition-all duration-150 ${
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
                    <span className="text-sm text-gray-600 dark:text-gray-400">Keep me signed in</span>
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#4F6BED] text-white text-sm font-semibold rounded-xl hover:bg-[#3D57D9] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-[#4F6BED]/20"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Send verification code <ArrowRight className="w-4 h-4" /></>}
                  </button>

                  <p className="text-center text-xs text-gray-400 dark:text-gray-500 pt-1">
                    No password needed. We&apos;ll send you a one-time code.
                  </p>
                </motion.form>
              ) : (
                /* Step 2: OTP */
                <motion.form
                  key="otp-step"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handleVerifyOtp}
                  className="space-y-4"
                >
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                      Verification code
                    </label>
                    <div className="relative">
                      <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        ref={otpInputRef}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="000000"
                        maxLength={6}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4F6BED]/50 focus:border-[#4F6BED] transition-all text-center text-2xl tracking-[0.5em] font-mono"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otp.length !== 6}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#4F6BED] text-white text-sm font-semibold rounded-xl hover:bg-[#3D57D9] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-[#4F6BED]/20"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Verify & Sign In <ArrowRight className="w-4 h-4" /></>}
                  </button>

                  {/* Resend */}
                  <div className="text-center">
                    {resendTimer > 0 ? (
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        Resend code in {resendTimer}s
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResend}
                        disabled={loading}
                        className="text-xs text-[#4F6BED] hover:text-[#3D57D9] font-medium transition-colors"
                      >
                        Resend code
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setStep('email');
                      setOtp('');
                      setError('');
                    }}
                    className="w-full flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors py-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Change email
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
