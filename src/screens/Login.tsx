import React, { useState } from 'react';
import { Card, Button, Input } from '../components/UI';
import { EyeOff, Mail, Lock, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async () => {
    setLoading(true);
    setError(null);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('Check your email for the confirmation link!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Google login failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-[1100px] bg-white rounded-[40px] overflow-hidden shadow-2xl flex border border-slate-100 min-h-[600px]">
        {/* Left Side - Image/Theme */}
        <div className="hidden lg:flex flex-1 relative overflow-hidden bg-blue-600">
          <img 
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&auto=format&fit=crop&q=80" 
            className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-60" 
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-blue-600/20 backdrop-blur-[1px]" />
          <div className="absolute top-12 left-12 flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-lg">
                <div className="w-5 h-5 border-4 border-blue-600 rounded-full" />
             </div>
             <span className="text-3xl font-black text-white tracking-tight">StratoCore</span>
          </div>
          
          <div className="absolute bottom-12 left-12 right-12 z-10">
             <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-10 rounded-[32px] shadow-2xl">
                <h3 className="text-3xl font-black text-white mb-4 italic leading-tight">"Efficiency is the ultimate form of academic excellence."</h3>
                <p className="text-blue-50 text-sm font-medium opacity-80">Empowering modern students with AI-integrated research tools, real-time analytics, and seamless project management.</p>
             </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-[45%] p-16 flex flex-col justify-center bg-white text-slate-900">
          <header className="text-center mb-10">
            <h1 className="text-4xl font-black tracking-tight mb-2">{isSignUp ? 'Create Account' : 'Welcome Back'}</h1>
            <p className="text-slate-500 font-medium text-sm">Please enter your details to continue</p>
          </header>
          
          <div className="space-y-6">
            {error && (
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm font-bold animate-in fade-in slide-in-from-top-2">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2">Email Address</label>
              <div className="relative group">
                <Input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@university.edu" 
                  className="bg-slate-50 border-slate-100 text-slate-900 placeholder:text-slate-400 h-14 rounded-2xl pl-12 focus:bg-white transition-all"
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2">Password</label>
              <div className="relative group">
                <Input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="bg-slate-50 border-slate-100 text-slate-900 placeholder:text-slate-400 h-14 rounded-2xl pl-12 pr-12 focus:bg-white transition-all"
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                <EyeOff className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 cursor-pointer hover:text-slate-600 transition-colors" />
              </div>
              {!isSignUp && (
                <div className="text-right">
                   <button className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors">Forgot password?</button>
                </div>
              )}
            </div>

            <Button 
              onClick={handleAuth} 
              disabled={loading}
              className="w-full h-14 rounded-2xl text-lg font-black shadow-xl shadow-blue-600/20 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-70"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isSignUp ? 'Sign Up' : 'Sign In')}
            </Button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100" />
              </div>
              <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
                <span className="bg-white px-4 text-slate-400">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={handleGoogleLogin}
                className="h-14 border border-slate-100 rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-50 hover:border-slate-200 transition-all font-bold text-sm shadow-sm"
              >
                <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" className="w-6 h-6" />
                Google
              </button>
              <button className="h-14 border border-slate-100 rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-50 hover:border-slate-200 transition-all font-bold text-sm shadow-sm opacity-50 cursor-not-allowed">
                <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" className="w-5 h-5" />
                Apple
              </button>
            </div>

            <p className="text-center text-sm font-bold text-slate-500 mt-8">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button 
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-blue-600 font-black hover:underline underline-offset-4 transition-all"
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
