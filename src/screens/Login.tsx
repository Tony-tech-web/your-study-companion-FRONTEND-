'use client';
import React, { useState } from 'react';
import { Button, Input } from '../components/UI';
import { Eye, EyeOff, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';

export const Login = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
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

  const onKey = (e: React.KeyboardEvent) => { if (e.key === 'Enter') mode === 'login' ? handleLogin() : handleSignup(); };

  return (
    <div className="min-h-screen bg-[#0F0F11] flex items-center justify-center p-4">
      <div className="w-full max-w-[960px] bg-white rounded-[40px] overflow-hidden shadow-2xl flex" style={{ minHeight: '560px' }}>
        <div className="hidden lg:flex flex-1 relative overflow-hidden">
          <img src="https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1200&auto=format&fit=crop&q=80" className="absolute inset-0 w-full h-full object-cover" referrerPolicy="no-referrer" alt="Campus" />
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
          <div className="absolute top-12 left-12 flex items-center gap-3 z-10">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-lg">
              <div className="w-5 h-5 border-4 border-orange-500 rounded-full" />
            </div>
            <span className="text-3xl font-black text-white tracking-tight">Orbit</span>
          </div>
          <div className="absolute bottom-12 left-12 right-12 z-10">
            <div className="bg-black/50 backdrop-blur-xl border border-white/20 p-8 rounded-[32px]">
              <h3 className="text-2xl font-bold text-white mb-2 italic">"The future of learning is circular."</h3>
              <p className="text-white/60 text-sm">Join thousands of students enhancing their research and grades with Orbit AI.</p>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-[44%] p-10 lg:p-14 flex flex-col justify-center bg-white text-gray-900 overflow-y-auto">
          <h1 className="text-3xl font-black text-center mb-1 tracking-tight">{mode === 'login' ? 'Sign in to Orbit' : 'Create account'}</h1>
          <p className="text-center text-sm text-gray-400 mb-8">{mode === 'login' ? 'Welcome back, student.' : 'Join the learning network.'}</p>

          {error && (
            <div className="mb-5 p-4 rounded-2xl bg-red-50 border border-red-100 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}

          <div className="space-y-4" onKeyDown={onKey}>
            {mode === 'signup' && (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Full Name *</label>
                  <Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your full name" className="bg-gray-50 border-gray-100 text-gray-900 placeholder:text-gray-300 h-12 rounded-2xl" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Username *</label>
                    <Input value={username} onChange={e => setUsername(e.target.value)} placeholder="Unique username" className="bg-gray-50 border-gray-100 text-gray-900 placeholder:text-gray-300 h-12 rounded-2xl" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Matric No.</label>
                    <Input value={matricNumber} onChange={e => setMatricNumber(e.target.value)} placeholder="EUI/..." className="bg-gray-50 border-gray-100 text-gray-900 placeholder:text-gray-300 h-12 rounded-2xl" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Phone</label>
                  <Input value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} placeholder="+234..." className="bg-gray-50 border-gray-100 text-gray-900 placeholder:text-gray-300 h-12 rounded-2xl" />
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Email *</label>
              <div className="relative">
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your.name@elizadeuniversity.edu.ng" className="bg-gray-50 border-gray-100 text-gray-900 placeholder:text-gray-300 h-12 rounded-2xl pl-11" />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Password *</label>
              <div className="relative">
                <Input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 characters" className="bg-gray-50 border-gray-100 text-gray-900 placeholder:text-gray-300 h-12 rounded-2xl pl-11 pr-11" />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {mode === 'login' && <div className="text-right"><button className="text-xs font-bold text-gray-400 hover:text-orange-500 transition-colors">Forgot password?</button></div>}
            </div>

            <button onClick={mode === 'login' ? handleLogin : handleSignup} disabled={loading} className="w-full h-12 rounded-2xl text-sm font-black text-white shadow-xl shadow-orange-500/20 active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2 mt-2" style={{ backgroundColor: '#f27d26' }}>
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>

            <p className="text-center text-sm font-medium text-gray-400 pt-1">
              {mode === 'login'
                ? <>{`Don't have an account? `}<button onClick={() => { setMode('signup'); setError(''); }} className="text-gray-900 font-bold hover:text-orange-500 transition-colors">Sign up</button></>
                : <>{'Already have an account? '}<button onClick={() => { setMode('login'); setError(''); }} className="text-gray-900 font-bold hover:text-orange-500 transition-colors">Sign in</button></>
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
