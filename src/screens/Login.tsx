'use client';
import React, { useState } from 'react';
import { AlertCircle, Eye, EyeOff, Loader2, Lock, Mail, Zap } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';

const GoogleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908C16.418 14.013 17.64 11.807 17.64 9.2z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
    <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
);

const Field = ({ label, icon: Icon, right, ...props }: any) => (
  <div className="space-y-1.5">
    <label className="text-[11px] font-black text-[var(--muted)] uppercase tracking-[0.08em]">{label}</label>
    <div className="relative">
      <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
      <input
        {...props}
        className="neo-inset w-full rounded-full pl-10 pr-10 py-3 text-[14px] font-semibold text-[var(--foreground)] placeholder:text-[var(--muted)] placeholder:opacity-45 backdrop-blur-xl focus:outline-none focus:ring-2 focus:ring-[var(--ring)]/30 focus:border-[var(--primary)]/30 transition-all"
      />
      {right && <div className="absolute right-3.5 top-1/2 -translate-y-1/2">{right}</div>}
    </div>
  </div>
);

export const Login = () => {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [matricNumber, setMatricNumber] = useState('');

  const switchMode = (next: 'login' | 'signup') => {
    setMode(next);
    setError('');
    setConfirmEmail('');
  };

  const handleSubmit = async () => {
    if (!email.trim() || !password) {
      setError('Please fill in all required fields.');
      return;
    }
    setLoading(true);
    setError('');
    setConfirmEmail('');
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        router.push('/dashboard');
      } else {
        if (!fullName.trim() || !username.trim()) {
          setError('Full name and username are required.');
          return;
        }
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: {
              full_name: fullName.trim(),
              username: username.trim(),
              matric_number: matricNumber.trim(),
            },
          },
        });
        if (error) throw error;
        if (data.session) router.push('/dashboard');
        else {
          setConfirmEmail(email.trim());
          setPassword('');
          setMode('login');
        }
      }
    } catch (e: any) {
      setError(e.message || 'Authentication failed. Check your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    setError('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
    } catch (e: any) {
      setError(e.message || 'Google sign-in failed.');
      setGoogleLoading(false);
    }
  };

  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-[var(--background)] text-[var(--foreground)] flex items-center justify-center p-4 py-8">
      <div className="pointer-events-none absolute -left-24 top-12 h-80 w-80 rounded-full bg-[var(--purple)]/18 blur-3xl" />
      <div className="pointer-events-none absolute -right-28 bottom-0 h-96 w-96 rounded-full bg-[var(--yellow)]/20 blur-3xl" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/30 bg-white/10 blur-sm" />
      <motion.div initial={{ opacity: 0, y: 16, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-[390px] premium-card rounded-[38px] overflow-hidden">
        <div className="h-px w-full bg-[var(--glass-highlight)]" />

        <div className="px-8 py-8 sm:px-9 sm:py-9">
          <div className="flex items-center gap-3 mb-9">
            <div className="w-10 h-10 rounded-2xl bg-[var(--primary)] flex items-center justify-center shadow-[var(--shadow-soft)]">
              <Zap className="w-4 h-4 text-[var(--primary-foreground)]" />
            </div>
            <span className="text-[18px] font-black text-[var(--foreground)] tracking-tight">Orbit</span>
          </div>

          <div className="mb-6">
            <h1 className="text-[22px] font-black text-[var(--foreground)] tracking-tight">
              {mode === 'login' ? 'Sign in' : 'Create account'}
            </h1>
            <p className="text-[13px] text-[var(--muted)] mt-0.5">
              {mode === 'login' ? 'New user?' : 'Already have an account?'}{' '}
              <button onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')} className="font-black text-[var(--foreground)] hover:opacity-75 transition-colors">
                {mode === 'login' ? 'Create an account' : 'Sign in'}
              </button>
            </p>
          </div>

          <AnimatePresence>
            {confirmEmail && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mb-4">
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                  <p className="text-sm font-black text-emerald-400 mb-1">Account created</p>
                  <p className="text-xs text-emerald-400/80 leading-relaxed">
                    We sent a confirmation link to <strong>{confirmEmail}</strong>. Confirm it, then sign in.
                  </p>
                </div>
              </motion.div>
            )}
            {error && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mb-4">
                <div className="flex items-start gap-2.5 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-[13px] text-red-400">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-3" onKeyDown={e => e.key === 'Enter' && handleSubmit()}>
            {mode === 'signup' && (
              <div className="space-y-3 overflow-hidden">
                <Field label="Full Name *" type="text" value={fullName} onChange={(e: any) => setFullName(e.target.value)} placeholder="Your full name" icon={({ className }: any) => <span className={`${className} text-[10px] font-black`}>ID</span>} />
                <div className="grid grid-cols-2 gap-2.5">
                  <Field label="Username *" type="text" value={username} onChange={(e: any) => setUsername(e.target.value)} placeholder="username" icon={({ className }: any) => <span className={`${className} text-sm font-black`}>@</span>} />
                  <Field label="Matric No." type="text" value={matricNumber} onChange={(e: any) => setMatricNumber(e.target.value)} placeholder="EUI/..." icon={({ className }: any) => <span className={`${className} text-xs font-black`}>#</span>} />
                </div>
              </div>
            )}

            <Field label="Email Address" type="email" value={email} onChange={(e: any) => setEmail(e.target.value)}
              placeholder="you@elizadeuniversity.edu.ng" icon={Mail} />
            <Field label="Password" type={showPw ? 'text' : 'password'} value={password}
              onChange={(e: any) => setPassword(e.target.value)} placeholder="Min. 6 characters" icon={Lock}
              right={
                <button type="button" onClick={() => setShowPw(v => !v)} className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />

            {mode === 'login' && (
              <div className="flex justify-end">
                <button className="text-[12px] font-semibold text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">Forgot password?</button>
              </div>
            )}

            <button onClick={handleSubmit} disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-full text-[14px] font-black text-[var(--primary-foreground)] disabled:opacity-50 premium-button bg-[var(--primary)] hover:opacity-90">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : mode === 'login' ? 'Login' : 'Create Account'}
            </button>

            <div className="flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-[var(--border)]" />
              <span className="text-[11px] font-medium text-[var(--muted)]">or</span>
              <div className="flex-1 h-px bg-[var(--border)]" />
            </div>

            <p className="text-center text-[10px] font-semibold text-[var(--muted)]">Join With Your Favorite Social Media Account</p>
            <div className="flex items-center justify-center gap-3">
              <button onClick={handleGoogle} disabled={googleLoading}
                className="neo-raised w-10 h-10 rounded-full text-[13px] font-semibold text-[var(--foreground)] hover:bg-[var(--accent)] btn-spring transition-all disabled:opacity-50 backdrop-blur-xl flex items-center justify-center">
                {googleLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GoogleIcon />}
              </button>
            </div>

            <p className="text-center text-[11px] text-[var(--muted)] leading-relaxed">
              By signing in, you agree to Orbit&apos;s{' '}
              <span className="underline cursor-pointer">Terms of Service</span> and{' '}
              <span className="underline cursor-pointer">Privacy Policy</span>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
