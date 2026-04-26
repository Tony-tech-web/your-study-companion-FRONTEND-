'use client';
import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, Loader2, AlertCircle, Zap, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

const GoogleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908C16.418 14.013 17.64 11.807 17.64 9.2z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
    <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
);

const Field = ({ label, type, value, onChange, placeholder, icon: Icon, right }: any) => (
  <div className="space-y-1.5">
    <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-[0.08em]">{label}</label>
    <div className="relative">
      <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
      <input type={type} value={value} onChange={onChange} placeholder={placeholder}
        className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-10 pr-10 py-3 text-[14px] text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#f27d26]/40 focus:border-[#f27d26] transition-all" />
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
  const [showConfirmBanner, setShowConfirmBanner] = useState(false);
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [matricNumber, setMatricNumber] = useState('');

  const handleSubmit = async () => {
    if (!email || !password) { setError('Please fill in all fields'); return; }
    setLoading(true); setError('');
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          if (error.message?.toLowerCase().includes('invalid login') || error.message?.includes('Email not confirmed')) {
            throw new Error('Invalid email or password. If you just signed up, please check your email and confirm your account first.');
          }
          throw error;
        }
        router.push('/dashboard');
      } else {
        if (!fullName || !username) { setError('Please fill in all required fields'); setLoading(false); return; }
        const { data, error } = await supabase.auth.signUp({
          email, password,
          options: { data: { full_name: fullName, username, matric_number: matricNumber } }
        });
        if (error) throw error;
        if (data.session) router.push('/dashboard');
        else { 
            setError(''); 
            setMode('login');
            // Show success state
            setTimeout(() => setError('✅ Account created! Check your inbox and confirm your email before signing in.'), 100);
          }
      }
    } catch (e: any) {
      setError(e.message || 'An error occurred');
    } finally { setLoading(false); }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true); setError('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` }
      });
      if (error) throw error;
    } catch (e: any) { setError(e.message || 'Google sign-in failed'); setGoogleLoading(false); }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#09090b] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 16, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm bg-white dark:bg-[#111113] border border-zinc-200 dark:border-white/8 rounded-3xl shadow-2xl shadow-black/10 dark:shadow-black/60 overflow-hidden">

        {/* Top accent */}
        <div className="h-0.5 w-full" style={{ background: 'linear-gradient(90deg, #f27d26, #f59e0b)' }} />

        <div className="px-8 py-8">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-xl bg-[#f27d26] flex items-center justify-center shadow-md shadow-orange-500/30">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-[15px] font-black text-zinc-900 dark:text-white tracking-tight">Orbit</span>
          </div>

          {/* Title */}
          <div className="mb-6">
            <h1 className="text-[22px] font-black text-zinc-900 dark:text-white tracking-tight">
              {mode === 'login' ? 'Sign in' : 'Create account'}
            </h1>
            <p className="text-[13px] text-zinc-400 mt-0.5">
              {mode === 'login' ? (
                <>New user?{' '}
                  <button onClick={() => { setMode('signup'); setError(''); }} className="font-bold text-zinc-900 dark:text-white hover:text-[#f27d26] transition-colors">
                    Create an account
                  </button>
                </>
              ) : (
                <>Already have an account?{' '}
                  <button onClick={() => { setMode('login'); setError(''); }} className="font-bold text-zinc-900 dark:text-white hover:text-[#f27d26] transition-colors">
                    Sign in
                  </button>
                </>
              )}
            </p>
          </div>

          {/* Error */}
          <AnimatePresence>
            {showConfirmBanner && (
        <div className="mb-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
          <p className="text-sm font-semibold text-emerald-400 mb-1">✅ Account created!</p>
          <p className="text-xs text-emerald-400/80 leading-relaxed">
            We sent a confirmation link to <strong>{email}</strong>. 
            Click it to verify your account, then come back to sign in.
          </p>
          <button onClick={() => { setShowConfirmBanner(false); setMode('login'); }}
            className="mt-3 text-xs font-semibold text-emerald-400 underline">
            Go to Sign In →
          </button>
        </div>
      )}
      {error && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mb-4">
                <div className="flex items-start gap-2.5 p-3 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-xl">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-[13px] text-red-600 dark:text-red-400">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Fields */}
          <div className="space-y-3" onKeyDown={e => e.key === 'Enter' && handleSubmit()}>
            <AnimatePresence>
              {mode === 'signup' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-3 overflow-hidden">
                  <Field label="Full Name *" type="text" value={fullName} onChange={(e: any) => setFullName(e.target.value)} placeholder="Your full name" icon={({ className }: any) => <span className={cn("text-zinc-400", className)}>✦</span>} />
                  <div className="grid grid-cols-2 gap-2.5">
                    <Field label="Username *" type="text" value={username} onChange={(e: any) => setUsername(e.target.value)} placeholder="username" icon={({ className }: any) => <span className={cn("text-zinc-400 text-sm", className)}>@</span>} />
                    <Field label="Matric No." type="text" value={matricNumber} onChange={(e: any) => setMatricNumber(e.target.value)} placeholder="EUI/..." icon={({ className }: any) => <span className={cn("text-zinc-400 text-xs font-bold", className)}>#</span>} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <Field label="Email Address" type="email" value={email} onChange={(e: any) => setEmail(e.target.value)}
              placeholder="you@elizadeuniversity.edu.ng" icon={Mail} />

            <Field label="Password" type={showPw ? 'text' : 'password'} value={password}
              onChange={(e: any) => setPassword(e.target.value)} placeholder="Min. 6 characters" icon={Lock}
              right={
                <button type="button" onClick={() => setShowPw(v => !v)} className="text-zinc-400 hover:text-zinc-600 transition-colors">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />

            {mode === 'login' && (
              <div className="flex justify-end">
                <button className="text-[12px] font-semibold text-zinc-400 hover:text-[#f27d26] transition-colors">Forgot password?</button>
              </div>
            )}

            {/* Submit */}
            <button onClick={handleSubmit} disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[14px] font-bold text-white disabled:opacity-50 btn-spring shadow-lg shadow-orange-500/20"
              style={{ backgroundColor: '#f27d26' }}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : mode === 'login' ? 'Login' : 'Create Account'}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-zinc-100 dark:bg-white/8" />
              <span className="text-[11px] font-medium text-zinc-400">or</span>
              <div className="flex-1 h-px bg-zinc-100 dark:bg-white/8" />
            </div>

            {/* Social buttons row (right-side reference style) */}
            <div className="flex items-center justify-center gap-3">
              <button onClick={handleGoogle} disabled={googleLoading}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 text-[13px] font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/10 btn-spring transition-all disabled:opacity-50">
                {googleLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GoogleIcon />}
                <span>Google</span>
              </button>
            </div>

            <p className="text-center text-[11px] text-zinc-400 leading-relaxed">
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
