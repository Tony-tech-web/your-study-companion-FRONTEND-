'use client';
import React, { useState } from 'react';
import { Input } from '../components/UI';
import { Eye, EyeOff, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.35, ease: [0.22, 1, 0.36, 1] } }),
};

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
    <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
);

export const Login = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [matricNumber, setMatricNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleLogin = async () => {
    if (!email || !password) { setError('Please fill in all fields'); return; }
    setLoading(true); setError('');
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setError(error.message); return; }
      router.push('/dashboard');
    } catch { setError('An unexpected error occurred'); }
    finally { setLoading(false); }
  };

  const handleSignup = async () => {
    if (!email || !password || !fullName || !username) { setError('Please fill in all required fields'); return; }
    setLoading(true); setError('');
    try {
      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: { data: { full_name: fullName, username, matric_number: matricNumber, phone_number: phoneNumber } }
      });
      if (error) { setError(error.message); return; }
      if (data.session) { router.push('/dashboard'); }
      else { setError('Account created! Check your email to confirm before signing in.'); setMode('login'); }
    } catch { setError('An unexpected error occurred'); }
    finally { setLoading(false); }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true); setError('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` }
      });
      if (error) setError(error.message);
    } catch { setError('Google sign-in failed'); }
    finally { setGoogleLoading(false); }
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') mode === 'login' ? handleLogin() : handleSignup();
  };

  const switchMode = (next: 'login' | 'signup') => { setMode(next); setError(''); };

  return (
    <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center p-4 overflow-hidden">

      {/* Ambient background glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-orange-500/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-orange-400/6 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[900px] bg-white rounded-[32px] overflow-hidden shadow-2xl flex relative z-10"
        style={{ minHeight: '540px' }}
      >
        {/* Left panel */}
        <div className="hidden lg:flex flex-1 relative overflow-hidden">
          <motion.img
            initial={{ scale: 1.08 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            src="https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1200&auto=format&fit=crop&q=80"
            className="absolute inset-0 w-full h-full object-cover"
            referrerPolicy="no-referrer"
            alt="Campus"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30" />

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="absolute top-10 left-10 flex items-center gap-2.5 z-10"
          >
            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-lg">
              <div className="w-4 h-4 border-[3px] border-orange-500 rounded-full" />
            </div>
            <span className="text-2xl font-black text-white tracking-tight">Orbit</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="absolute bottom-10 left-10 right-10 z-10"
          >
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-7 rounded-3xl">
              <p className="text-xl font-bold text-white mb-2 italic leading-snug">
                "The future of learning is circular."
              </p>
              <p className="text-white/50 text-sm">
                Join students enhancing their research and grades with Orbit AI.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Right panel */}
        <div className="w-full lg:w-[42%] flex flex-col justify-center bg-white overflow-y-auto">
          <div className="px-10 py-10">

            {/* Header */}
            <motion.div
              key={mode + '-header'}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-7 text-center"
            >
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                {mode === 'login' ? 'Sign in to Orbit' : 'Create account'}
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                {mode === 'login' ? 'Welcome back, student.' : 'Join the learning network.'}
              </p>
            </motion.div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-5 overflow-hidden"
                >
                  <div className="p-3 rounded-xl bg-red-50 border border-red-100 flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-3" onKeyDown={onKey}>

              {/* Google button */}
              <motion.button
                custom={0} variants={fadeUp} initial="hidden" animate="show"
                onClick={handleGoogle}
                disabled={googleLoading}
                className="w-full h-11 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-semibold flex items-center justify-center gap-2.5 hover:bg-gray-50 hover:border-gray-300 active:scale-[0.98] transition-all disabled:opacity-60 shadow-sm"
              >
                {googleLoading ? <Loader2 className="w-4 h-4 animate-spin text-gray-400" /> : <GoogleIcon />}
                Continue with Google
              </motion.button>

              {/* Divider */}
              <motion.div custom={1} variants={fadeUp} initial="hidden" animate="show" className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-xs text-gray-300 font-medium uppercase tracking-wider">or</span>
                <div className="flex-1 h-px bg-gray-100" />
              </motion.div>

              {/* Signup extra fields */}
              <AnimatePresence>
                {mode === 'signup' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3 overflow-hidden"
                  >
                    <div>
                      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest px-0.5 mb-1 block">Full Name *</label>
                      <Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your full name" className="bg-gray-50 border-gray-100 text-gray-900 placeholder:text-gray-300 h-11 rounded-xl" />
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest px-0.5 mb-1 block">Username *</label>
                        <Input value={username} onChange={e => setUsername(e.target.value)} placeholder="username" className="bg-gray-50 border-gray-100 text-gray-900 placeholder:text-gray-300 h-11 rounded-xl" />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest px-0.5 mb-1 block">Matric No.</label>
                        <Input value={matricNumber} onChange={e => setMatricNumber(e.target.value)} placeholder="EUI/..." className="bg-gray-50 border-gray-100 text-gray-900 placeholder:text-gray-300 h-11 rounded-xl" />
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest px-0.5 mb-1 block">Phone</label>
                      <Input value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} placeholder="+234..." className="bg-gray-50 border-gray-100 text-gray-900 placeholder:text-gray-300 h-11 rounded-xl" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email */}
              <motion.div custom={2} variants={fadeUp} initial="hidden" animate="show">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest px-0.5 mb-1 block">Email *</label>
                <div className="relative">
                  <Input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="you@elizadeuniversity.edu.ng"
                    className="bg-gray-50 border-gray-100 text-gray-900 placeholder:text-gray-300 h-11 rounded-xl pl-10" />
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                </div>
              </motion.div>

              {/* Password */}
              <motion.div custom={3} variants={fadeUp} initial="hidden" animate="show">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest px-0.5">Password *</label>
                  {mode === 'login' && (
                    <button className="text-[11px] font-semibold text-gray-400 hover:text-orange-500 transition-colors">
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="bg-gray-50 border-gray-100 text-gray-900 placeholder:text-gray-300 h-11 rounded-xl pl-10 pr-10" />
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </motion.div>

              {/* Submit */}
              <motion.button
                custom={4} variants={fadeUp} initial="hidden" animate="show"
                onClick={mode === 'login' ? handleLogin : handleSignup}
                disabled={loading}
                whileTap={{ scale: 0.97 }}
                className="w-full h-11 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 mt-1 disabled:opacity-60 transition-opacity shadow-lg shadow-orange-500/25"
                style={{ backgroundColor: '#f27d26' }}
              >
                {loading
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : mode === 'login' ? 'Sign In' : 'Create Account'
                }
              </motion.button>

              {/* Switch mode */}
              <motion.p
                custom={5} variants={fadeUp} initial="hidden" animate="show"
                className="text-center text-sm text-gray-400 pt-0.5"
              >
                {mode === 'login' ? (
                  <>Don&apos;t have an account?{' '}
                    <button onClick={() => switchMode('signup')} className="text-gray-800 font-bold hover:text-orange-500 transition-colors">Sign up</button>
                  </>
                ) : (
                  <>Already have an account?{' '}
                    <button onClick={() => switchMode('login')} className="text-gray-800 font-bold hover:text-orange-500 transition-colors">Sign in</button>
                  </>
                )}
              </motion.p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
