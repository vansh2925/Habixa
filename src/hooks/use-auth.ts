'use client';

import { useState, useEffect, useCallback } from 'react';
import { User, AuthChangeEvent, Session } from '@supabase/supabase-js';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

interface AuthState {
  user: User | null;
  loading: boolean;
  isConfigured: boolean;
}

export function useAuth(): AuthState & {
  signInWithOtp: (email: string) => Promise<{ error?: string }>;
  verifyOtp: (email: string, token: string) => Promise<{ error?: string; success?: boolean }>;
  signOut: () => Promise<void>;
} {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const configured = isSupabaseConfigured();

  useEffect(() => {
    if (!configured) {
      setLoading(false);
      return;
    }

    async function getUser() {
      const supabase = createClient();
      const result = await supabase.auth.getUser();
      setUser(result.data.user);
      setLoading(false);
    }

    getUser();

    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, [configured]);

  const signInWithOtp = useCallback(async (email: string): Promise<{ error?: string }> => {
    if (!configured) return { error: 'Supabase not configured. Add env vars in Vercel.' };
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithOtp({ email });
      if (error) {
        // Supabase errors are class instances — manually extract properties
        const parts: string[] = [];
        if (error.message) parts.push(error.message);
        const raw = error as unknown as Record<string, unknown>;
        if (raw.code) parts.push(String(raw.code));
        if (raw.status) parts.push(String(raw.status));
        const errStr = parts.join(' | ') || 'Failed to send OTP code';
        console.error('Supabase signIn error:', error);
        return { error: errStr };
      }
      return {};
    } catch (e: unknown) {
      console.error('signInWithOtp catch:', e);
      if (e instanceof Error) return { error: e.message };
      return { error: String(e) };
    }
  }, [configured]);

  const verifyOtp = useCallback(async (email: string, token: string): Promise<{ error?: string; success?: boolean }> => {
    if (!configured) return { error: 'Supabase not configured' };
    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });
    if (error) return { error: error.message };
    return { success: true };
  }, [configured]);

  const signOut = useCallback(async (): Promise<void> => {
    if (!configured) return;
    const supabase = createClient();
    await supabase.auth.signOut();
    localStorage.removeItem('habitflow-remember-me');
    window.location.href = '/login';
  }, [configured]);

  return { user, loading, isConfigured: configured, signInWithOtp, verifyOtp, signOut };
}
